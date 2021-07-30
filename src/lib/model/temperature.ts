export class Temperature {
  constructor(private _celcius: any) {}

  get celcius() {
    return this._celcius;
  }

  get farenheit() {
    return this._celcius * 1.8 + 32;
  }
}
