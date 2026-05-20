import { getValidationMessages } from './validate-dto';

describe('validate-dto test utils', () => {
  it('should return empty array when validation error has no constraints', () => {
    const messages = getValidationMessages([
      {
        property: 'field',
      },
    ]);

    expect(messages).toEqual([]);
  });
});
