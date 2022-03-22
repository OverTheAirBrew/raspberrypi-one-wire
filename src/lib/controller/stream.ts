import { BaseController } from "./base";

interface IStreamDevice {
  address: string;
  expectedValues: number[];
}

export class StreamController extends BaseController {
  private index = 0;

  constructor(private repeatable: boolean, private devices: IStreamDevice[]) {
    super();
  }

  public async findDevices(hint?: string): Promise<string[]> {
    return this.devices.map((device) => device.address);
  }

  protected async readData(deviceName: string) {
    const values = this.devices.find(
      (dev) => dev.address === deviceName
    )?.expectedValues;

    if (!values || !values.length || this.index === values.length) {
      throw new Error("No values");
    }

    try {
      return `${values[this.index]}`;
    } finally {
      this.index++;
      if (this.repeatable) {
        this.index %= values.length;
      }
    }
  }

  protected async parseData(rawData: string) {
    return parseInt(rawData);
  }
}
