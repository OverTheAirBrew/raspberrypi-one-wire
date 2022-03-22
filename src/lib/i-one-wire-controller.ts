import { ClassType } from "./class-type";
import { Temperature } from "./model/temperature";

export interface IOneWireController {
  getCurrentValue(deviceName: string): Promise<Temperature>;
  findDevices(hint?: string): Promise<string[]>;
}

export const IOneWireController =
  class Dummy {} as ClassType<IOneWireController>;
