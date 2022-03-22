import { ClassType } from "./class-type";
import { Temperature } from "./model/temperature";

export interface IOneWireController {
  current(): Promise<Temperature>;
}

export const IOneWireController =
  class Dummy {} as ClassType<IOneWireController>;
