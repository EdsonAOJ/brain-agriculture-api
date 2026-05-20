import { getValidationMessages, validateDto } from '../test-utils/validate-dto';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('should validate an empty payload because defaults are allowed', async () => {
    const errors = await validateDto(PaginationQueryDto, {});

    expect(errors).toHaveLength(0);
  });

  it('should validate valid pagination params', async () => {
    const errors = await validateDto(PaginationQueryDto, {
      page: 1,
      limit: 10,
    });

    expect(errors).toHaveLength(0);
  });

  it('should reject page lower than 1', async () => {
    const errors = await validateDto(PaginationQueryDto, {
      page: 0,
      limit: 10,
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain('A página deve ser maior ou igual a 1.');
  });

  it('should reject limit lower than 1', async () => {
    const errors = await validateDto(PaginationQueryDto, {
      page: 1,
      limit: 0,
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain('O limite deve ser maior ou igual a 1.');
  });

  it('should reject limit greater than 100', async () => {
    const errors = await validateDto(PaginationQueryDto, {
      page: 1,
      limit: 101,
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain('O limite máximo por página é 100.');
  });

  it('should reject non-integer values', async () => {
    const errors = await validateDto(PaginationQueryDto, {
      page: 1.5,
      limit: 10.5,
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain('A página deve ser um número inteiro.');
    expect(messages).toContain('O limite deve ser um número inteiro.');
  });
});
