import { IOneWireController } from "../i-one-wire-controller";
import { Temperature } from "../model/temperature";

export abstract class BaseController implements IOneWireController {
  public async getCurrentValue(deviceName: string): Promise<Temperature> {
    const rawData = await this.readData(deviceName);
    const parsedData = await this.parseData(rawData);
    return new Temperature(parsedData);
  }

  protected abstract readData(deviceName: string): Promise<string>;
  protected abstract parseData(rawData: string): Promise<number>;

  public abstract findDevices(deviceName: string): Promise<string[]>;
}
