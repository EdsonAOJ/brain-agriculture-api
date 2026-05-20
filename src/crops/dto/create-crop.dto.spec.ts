import {
  getValidationMessages,
  validateDto,
} from '../../common/test-utils/validate-dto';
import { CreateCropDto } from './create-crop.dto';

describe('CreateCropDto', () => {
  it('should validate a valid crop payload', async () => {
    const errors = await validateDto(CreateCropDto, {
      name: 'Soja',
    });

    expect(errors).toHaveLength(0);
  });

  it('should reject empty payload', async () => {
    const errors = await validateDto(CreateCropDto, {});
    const messages = getValidationMessages(errors);

    expect(messages).toContain('O nome da cultura é obrigatório.');
  });

  it('should reject crop name longer than allowed', async () => {
    const errors = await validateDto(CreateCropDto, {
      name: 'a'.repeat(81),
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain(
      'O nome da cultura deve ter no máximo 80 caracteres.',
    );
  });
});
