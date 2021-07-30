import { BaseController } from './base';

export class StreamController extends BaseController {
  private index = 0;

  constructor(private repeatable: boolean, private values: number[]) {
    super();
  }

  protected async readData() {
    if (this.index === this.values.length) {
      throw new Error('No values');
    }

    try {
      return `${this.values[this.index]}`;
    } finally {
      this.index++;
      if (this.repeatable) {
        this.index %= this.values.length;
      }
    }
  }

  protected async parseData(rawData: string) {
    return parseInt(rawData);
  }
}
