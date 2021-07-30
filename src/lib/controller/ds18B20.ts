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
    const data = rawData.split('t=');

    if (data.length !== 2) {
      throw new Error('Raw data does not have a valid length');
    }

    return parseInt(data[1]) / 1000
  }
}
