import {
  getValidationMessages,
  validateDto,
} from '../../common/test-utils/validate-dto';
import { CreateHarvestDto } from './create-harvest.dto';

describe('CreateHarvestDto', () => {
  it('should validate a valid harvest payload', async () => {
    const errors = await validateDto(CreateHarvestDto, {
      name: 'Safra 2021',
    });

    expect(errors).toHaveLength(0);
  });

  it('should reject empty payload', async () => {
    const errors = await validateDto(CreateHarvestDto, {});
    const messages = getValidationMessages(errors);

    expect(messages).toContain('O nome da safra é obrigatório.');
  });

  it('should reject harvest name longer than allowed', async () => {
    const errors = await validateDto(CreateHarvestDto, {
      name: 'a'.repeat(81),
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain(
      'O nome da safra deve ter no máximo 80 caracteres.',
    );
  });
});
