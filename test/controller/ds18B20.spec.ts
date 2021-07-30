import { setGracefulCleanup, fileSync, FileResult } from 'tmp';
import { writeSync } from 'fs';
import { DS18B20Controller } from '../../src/lib/controller/ds18B20';
import { expect } from 'chai';

setGracefulCleanup();

const VALID_RAW_DATA =
  '72 01 4b 46 7f ff 0e 10 57 : crc=57 YES\n' +
  '72 01 4b 46 7f ff 0e 10 57 t=23125\n';

describe('lib/controllers/ds18B20', () => {
  let tempDevice: FileResult;

  beforeEach(() => {
    tempDevice = fileSync({
      mode: 0o644,
      prefix: 'raspi-1wire-temp-unittest-',
      postfix: '.dev',
    });
    writeSync(tempDevice.fd, VALID_RAW_DATA);
  });

  afterEach(() => {
    tempDevice.removeCallback();
  });

  it('should return a valid temp if the file is available', async () => {
    const controller = new DS18B20Controller(tempDevice.name);

    const result = await controller.current();
    expect(result.celcius).to.eq(23.125);
  });

  it('should error if the device does not exist', async () => {
    tempDevice.removeCallback();

    const controller = new DS18B20Controller(tempDevice.name);

    try {
      await controller.current();
      expect.fail('should have throw an error');
    } catch (err) {
      expect(err.message).to.eq('One wire sensor does not exist');
    }
  });
});
