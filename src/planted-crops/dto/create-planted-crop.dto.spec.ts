import {
  getValidationMessages,
  validateDto,
} from '../../common/test-utils/validate-dto';
import { CreatePlantedCropDto } from './create-planted-crop.dto';

describe('CreatePlantedCropDto', () => {
  it('should validate a valid planted crop payload', async () => {
    const errors = await validateDto(CreatePlantedCropDto, {
      harvestId: 'd7c5c5a2-8a64-48ad-b9a5-985a39f2f6d7',
      cropId: 'e8c6e7c9-2f19-4c2f-85bb-8b0a9c9a2b13',
    });

    expect(errors).toHaveLength(0);
  });

  it('should reject empty payload', async () => {
    const errors = await validateDto(CreatePlantedCropDto, {});
    const messages = getValidationMessages(errors);

    expect(messages).toContain('O ID da safra é obrigatório.');
    expect(messages).toContain('O ID da cultura é obrigatório.');
  });

  it('should reject invalid UUIDs', async () => {
    const errors = await validateDto(CreatePlantedCropDto, {
      harvestId: 'invalid-harvest-id',
      cropId: 'invalid-crop-id',
    });

    const messages = getValidationMessages(errors);

    expect(messages).toContain('O ID da safra deve ser um UUID válido.');
    expect(messages).toContain('O ID da cultura deve ser um UUID válido.');
  });
});
