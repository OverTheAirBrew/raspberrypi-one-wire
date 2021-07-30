import { OneWireFactory } from '../src';
import { expect } from 'chai';

import { fileSync, FileResult } from 'tmp';
import { dirname, normalize } from 'path';

import * as sinon from 'sinon';
import * as glob from 'glob';
import { DS18B20Controller } from '../src/lib/controller/ds18B20';
import { StreamController } from '../src/lib/controller/stream';

describe('factory', () => {
  let factory: OneWireFactory;

  beforeEach(() => {
    factory = new OneWireFactory();
  });

  it('should respond to findDevices', async () => {
    expect(factory).to.respondTo('findDevices');
  });

  it('should respond to fromDevice', async () => {
    expect(factory).to.respondTo('fromDevice');
  });

  it('should respond to fromStream', async () => {
    expect(factory).to.respondTo('fromStream');
  });

  describe('fromDevices', () => {
    let factory: OneWireFactory;

    const testDevices: FileResult[] = [];
    const testDeviceNames: string[] = [];

    let syncSpy: sinon.SinonSpy;

    let prefix = 'raspberrypi-one-wire-tests-';
    let postfix = '.dev';

    beforeEach(() => {
      factory = new OneWireFactory();
      syncSpy = sinon.spy(glob, 'sync');
    });

    afterEach(() => {
      testDevices.forEach((device) => {
        device.removeCallback();
      });

      sinon.restore();
    });

    it('should read from the hint directory', async () => {
      async function createTestDevices(numberOfDevices: number) {
        for (let i = 0; i < numberOfDevices; i++) {
          const device = fileSync({
            mode: 0o644,
            prefix,
            postfix,
          });

          testDevices.push(device);
          testDeviceNames.push(normalize(device.name));
        }
      }

      await createTestDevices(5);

      const tempDir = dirname(testDeviceNames[0]);
      const pattern = `${tempDir}/${prefix}*${postfix}`;

      const devices = await factory.findDevices(pattern);

      expect(devices).to.have.lengthOf(testDeviceNames.length);
      expect(devices).to.have.members(testDeviceNames);

      expect(syncSpy.callCount).to.eq(1);

      const [syncPattern] = syncSpy.firstCall.args;
      expect(syncPattern).to.eq(pattern);
    });

    it('should work without a hint', async () => {
      const devices = await factory.findDevices();
      expect(devices).to.be.instanceOf(Array);

      expect(syncSpy.callCount).to.eq(1);

      const [pattern] = syncSpy.firstCall.args;
      expect(pattern).to.eq('/sys/bus/w1/devices/28-*/w1_slave');
    });
  });

  describe('fromDevice', () => {
    it('should return a DS18B20 controller', async () => {
      const device = await factory.fromDevice('fakeDevice');
      expect(device).to.be.instanceOf(DS18B20Controller);
    });
  });

  describe('fromStream', () => {
    it('should return a stream controller', async () => {
      const device = await factory.fromStream(false, [1, 2, 3, 4]);
      expect(device).to.be.instanceOf(StreamController);
    });
  });
});
