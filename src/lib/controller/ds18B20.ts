import { BaseController } from './base';
import { existsSync, readFileSync } from 'fs';

export class DS18B20Controller extends BaseController {
  constructor(private deviceName: string) {
    super();
  }

  protected async readData() {
    if (!existsSync(this.deviceName)) {
      throw new Error('One wire sensor does not exist');
    }

    return readFileSync(this.deviceName).toString('utf-8');
  }

  protected async parseData(rawData: string) {
    const data = rawData.split('\n');

    if (data.length !== 2) {
      throw new Error('Raw data does not have a valid length');
    }

    // const line1 = rawData[0].split(':');

    const line2 = data[1].split(' ');
    const rawTemperature = parseInt(line2[line2.length - 1].replace('t=', ''));
    return rawTemperature / 1000;
  }
}
