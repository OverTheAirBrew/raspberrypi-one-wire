import { sync } from "fast-glob";
import { existsSync, readFileSync } from "fs";
import { normalize } from "path";
import { DataIncorrectFormatError } from "../../errors/incorrect-data-format-error";
import { SensorNotFoundError } from "../../errors/sensor-not-found-error";
import { BaseController } from "./base";

export class DS18B20Controller extends BaseController {
  constructor() {
    super();
  }

  public async findDevices(): Promise<string[]> {
    const files = sync("/sys/bus/w1/devices/28-*/w1_slave");
    const normalizedFiles = files.map((file) => normalize(file));
    return normalizedFiles;
  }

  protected async readData(deviceName: string) {
    const devicePath = `/sys/bus/w1/devices/${deviceName}/w1_slave`;

    if (!existsSync(devicePath)) {
      throw new SensorNotFoundError(
        `Sensor with address ${deviceName} not found`
      );
    }

    return readFileSync(devicePath).toString("utf-8");
  }

  protected async parseData(rawData: string) {
    const data = rawData.split("t=");

    if (data.length !== 2) {
      throw new DataIncorrectFormatError(
        "Raw data is not in the expected format"
      );
    }

    return parseInt(data[1].replace("\n", "")) / 1000;
  }
}
