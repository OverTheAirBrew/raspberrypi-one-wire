import { sync } from 'glob';
import { normalize } from 'path';
import { DS18B20Controller } from './controller/ds18B20';
import { StreamController } from './controller/stream';
import { Service } from 'typedi';

@Service()
export class OneWireFactory {
  public async findDevices(hint?: string): Promise<string[]> {
    const pattern = hint ?? '/sys/bus/w1/devices/28-*/w1_slave';
    const files = sync(pattern);
    const normalizedFiles = files.map((file) => normalize(file));
    return normalizedFiles;
  }

  public async fromDevice(device: string): Promise<DS18B20Controller> {
    return new DS18B20Controller(device);
  }

  public async fromStream(
    repeatable: boolean,
    values: number[],
  ): Promise<StreamController> {
    return new StreamController(repeatable, values);
  }
}
