import { validateFarmAreas } from './farm-area.validator';

describe('validateFarmAreas', () => {
  it('should return valid when agricultural area plus vegetation area is less than total area', () => {
    const result = validateFarmAreas({
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 250,
    });

    expect(result).toEqual({
      isValid: true,
      usedArea: 950,
      availableArea: 50,
    });
  });

  it('should return valid when agricultural area plus vegetation area equals total area', () => {
    const result = validateFarmAreas({
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 300,
    });

    expect(result).toEqual({
      isValid: true,
      usedArea: 1000,
      availableArea: 0,
    });
  });

  it('should return invalid when agricultural area plus vegetation area exceeds total area', () => {
    const result = validateFarmAreas({
      totalArea: 1000,
      agriculturalArea: 800,
      vegetationArea: 300,
    });

    expect(result).toEqual({
      isValid: false,
      usedArea: 1100,
      availableArea: -100,
    });
  });

  it('should return valid when agricultural area and vegetation area are zero', () => {
    const result = validateFarmAreas({
      totalArea: 1000,
      agriculturalArea: 0,
      vegetationArea: 0,
    });

    expect(result).toEqual({
      isValid: true,
      usedArea: 0,
      availableArea: 1000,
    });
  });
});
