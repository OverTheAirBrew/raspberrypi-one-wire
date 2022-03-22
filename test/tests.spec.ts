import { expect } from "chai";
import * as glob from "fast-glob";
import * as fs from "fs";
import sinon from "ts-sinon";
import { DS18B20Controller, StreamController } from "../src";
import { Temperature } from "../src/lib/model/temperature";

describe("plugin/one-wire", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("controller", () => {
    describe("temperature", () => {
      it("should return the correct values", async () => {
        const temperature = new Temperature(10.0);
        expect(temperature.celcius).to.eq(10.0);
        expect(temperature.farenheit).to.eq(50.0);
      });
    });

    describe("stream", () => {
      describe("getCurrentValue", () => {
        it("should throw an error if there are no values", async () => {
          const controller = new StreamController(true, []);

          try {
            await controller.getCurrentValue("");
            expect.fail("should have thrown an error");
          } catch (err) {
            expect(err.message).to.eq(`Sensor with address  not found`);
          }
        });

        it("should error if there is a device with no values", async () => {
          const controller = new StreamController(true, [
            { address: "1234", expectedValues: [] },
          ]);

          try {
            await controller.getCurrentValue("");
            expect.fail("should have thrown an error");
          } catch (err) {
            expect(err.message).to.eq(`Sensor with address  not found`);
          }
        });

        it("should cycle through the given values", async () => {
          const controller = new StreamController(true, [
            { address: "1234", expectedValues: [1, 2, 3, 4] },
          ]);

          const firstValue = await controller.getCurrentValue("1234");
          expect(firstValue.celcius).to.eq(1);

          const secondValue = await controller.getCurrentValue("1234");
          expect(secondValue.celcius).to.eq(2);

          const thirdValue = await controller.getCurrentValue("1234");
          expect(thirdValue.celcius).to.eq(3);

          const fourthValue = await controller.getCurrentValue("1234");
          expect(fourthValue.celcius).to.eq(4);

          const secondFirst = await controller.getCurrentValue("1234");
          expect(secondFirst.celcius).to.eq(1);
        });

        it("should error when not repeatable and requests greater then values", async () => {
          const controller = new StreamController(false, [
            { address: "1234", expectedValues: [1, 2, 3, 4] },
          ]);

          try {
            await controller.getCurrentValue("1234");
            await controller.getCurrentValue("1234");
            await controller.getCurrentValue("1234");
            await controller.getCurrentValue("1234");
            await controller.getCurrentValue("1234");

            expect.fail("should have errored");
          } catch (err) {
            expect(err.message).to.eq(`Sensor with address 1234 not found`);
          }
        });
      });
    });

    describe("D218B20Controller", () => {
      let controller: DS18B20Controller;

      const VALID_RAW_DATA =
        "72 01 4b 46 7f ff 0e 10 57 : crc=57 YES\n" +
        "72 01 4b 46 7f ff 0e 10 57 t=23125\n";

      beforeEach(() => {
        controller = new DS18B20Controller();
      });

      afterEach(() => {});

      describe("findDevices", () => {
        let globSpy: sinon.SinonSpy;

        beforeEach(() => {
          globSpy = sinon.spy(glob, "sync");
        });

        it("should get the sensors from the correct location", async () => {
          const devices = await controller.findDevices();
          expect(devices).to.be.instanceOf(Array);

          expect(globSpy.callCount).to.eq(1);

          const [pattern] = globSpy.firstCall.args;
          expect(pattern).to.eq("/sys/bus/w1/devices/28-*/w1_slave");
        });
      });

      describe("getCurrentValue", () => {
        it("should throw an error if the data is invalid", async () => {
          sinon.stub(fs, "existsSync").returns(true);
          sinon.stub(fs, "readFileSync").returns(Buffer.from("INVALID"));

          try {
            await controller.getCurrentValue("TEST");
            expect.fail("should have thrown an error");
          } catch (err) {
            expect(err.message).to.eq(`Raw data is not in the expected format`);
          }
        });

        it("should return a valid temp if the file is available", async () => {
          sinon.stub(fs, "existsSync").returns(true);
          sinon.stub(fs, "readFileSync").returns(Buffer.from(VALID_RAW_DATA));

          const result = await controller.getCurrentValue("TEST");
          expect(result.celcius).to.eq(23.125);
        });

        it("should error if the device does not exist", async () => {
          const controller = new DS18B20Controller();

          try {
            await controller.getCurrentValue("TEST");
            expect.fail("should have throw an error");
          } catch (err) {
            expect(err.message).to.eq(`Sensor with address TEST not found`);
          }
        });
      });
    });
  });
});
