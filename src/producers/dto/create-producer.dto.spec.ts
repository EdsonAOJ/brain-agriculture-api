import {
  getValidationMessages,
  validateDto,
} from '../../common/test-utils/validate-dto';
import { CreateProducerDto } from './create-producer.dto';

describe('CreateProducerDto', () => {
  it('should validate a valid producer payload', async () => {
    const errors = await validateDto(CreateProducerDto, {
      document: '529.982.247-25',
      name: 'João da Silva',
    });

    expect(errors).toHaveLength(0);
  });

  it('should reject empty payload', async () => {
    const errors = await validateDto(CreateProducerDto, {});
    const messages = getValidationMessages(errors);

    expect(messages).toContain('O CPF/CNPJ é obrigatório.');
    expect(messages).toContain('O nome do produtor é obrigatório.');
  });

  it('should reject document longer than allowed', async () => {
    const errors = await validateDto(CreateProducerDto, {
      document: '1'.repeat(19),
      name: 'João da Silva',
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain('O CPF/CNPJ deve ter no máximo 18 caracteres.');
  });

  it('should reject producer name longer than allowed', async () => {
    const errors = await validateDto(CreateProducerDto, {
      document: '529.982.247-25',
      name: 'a'.repeat(121),
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain(
      'O nome do produtor deve ter no máximo 120 caracteres.',
    );
  });
});
