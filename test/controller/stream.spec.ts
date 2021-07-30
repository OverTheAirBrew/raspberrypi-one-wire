import { expect } from 'chai';
import { StreamController } from '../../src/lib/controller/stream';

describe('lib/controller/stream', () => {
  it('should cycle through the given values', async () => {
    const controller = new StreamController(true, [1, 2, 3, 4]);

    const firstValue = await controller.current();
    expect(firstValue.celcius).to.eq(1);

    const secondValue = await controller.current();
    expect(secondValue.celcius).to.eq(2);

    const thirdValue = await controller.current();
    expect(thirdValue.celcius).to.eq(3);

    const fourthValue = await controller.current();
    expect(fourthValue.celcius).to.eq(4);

    const secondFirst = await controller.current();
    expect(secondFirst.celcius).to.eq(1);
  });

  it('should error when not repeatable and requests greater then values', async () => {
    const controller = new StreamController(false, [1, 2, 3, 4]);

    try {
      await controller.current();
      await controller.current();
      await controller.current();
      await controller.current();
      await controller.current();

      expect.fail('should have errored');
    } catch (err) {
      expect(err.message).to.eq('No values');
    }
  });
});
