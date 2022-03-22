import { sync } from "fast-glob";
import { existsSync, readFileSync } from "fs";
import { normalize } from "path";
import { BaseController } from "./base";

export class DS18B20Controller extends BaseController {
  constructor() {
    super();
  }

  public async findDevices(hint?: string): Promise<string[]> {
    const pattern = hint ?? "/sys/bus/w1/devices/28-*/w1_slave";
    const files = sync(pattern);
    const normalizedFiles = files.map((file) => normalize(file));
    return normalizedFiles;
  }

  protected async readData(deviceName: string) {
    if (!existsSync(deviceName)) {
      throw new Error("One wire sensor does not exist");
    }

    return readFileSync(deviceName).toString("utf-8");
  }

  protected async parseData(rawData: string) {
    const data = rawData.split("t=");

    if (data.length !== 2) {
      throw new Error("Raw data is not in the expected format");
    }

    return parseInt(data[1].replace("\n", "")) / 1000;
  }
}
