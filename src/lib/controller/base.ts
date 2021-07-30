import { Temperature } from '../model/temperature';

export abstract class BaseController {
  public async current() {
    const rawData = await this.readData();
    const parsedData = await this.parseData(rawData);
    return new Temperature(parsedData);
  }

  protected abstract readData(): Promise<string>;
  protected abstract parseData(rawData: string): Promise<number>;
}
