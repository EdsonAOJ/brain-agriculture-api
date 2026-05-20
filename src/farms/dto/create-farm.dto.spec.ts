import {
  getValidationMessages,
  validateDto,
} from '../../common/test-utils/validate-dto';
import { CreateFarmDto } from './create-farm.dto';

describe('CreateFarmDto', () => {
  it('should validate a valid farm payload', async () => {
    const errors = await validateDto(CreateFarmDto, {
      name: 'Fazenda Boa Vista',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 250,
    });

    expect(errors).toHaveLength(0);
  });

  it('should reject empty payload', async () => {
    const errors = await validateDto(CreateFarmDto, {});
    const messages = getValidationMessages(errors);

    expect(messages).toContain('O nome da fazenda é obrigatório.');
    expect(messages).toContain('A cidade é obrigatória.');
    expect(messages).toContain('O estado é obrigatório.');
  });

  it('should reject invalid area values', async () => {
    const errors = await validateDto(CreateFarmDto, {
      name: 'Fazenda Boa Vista',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: 0,
      agriculturalArea: -1,
      vegetationArea: -1,
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain('A área total deve ser maior que zero.');
    expect(messages).toContain('A área agricultável não pode ser negativa.');
    expect(messages).toContain('A área de vegetação não pode ser negativa.');
  });

  it('should reject state longer than 2 characters', async () => {
    const errors = await validateDto(CreateFarmDto, {
      name: 'Fazenda Boa Vista',
      city: 'Ribeirão Preto',
      state: 'SPO',
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 250,
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain('O estado deve ter no máximo 2 caracteres.');
  });
});
