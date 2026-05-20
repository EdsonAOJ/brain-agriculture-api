export interface FarmAreaValidationInput {
  totalArea: number;
  agriculturalArea: number;
  vegetationArea: number;
}

export interface FarmAreaValidationResult {
  isValid: boolean;
  usedArea: number;
  availableArea: number;
}

export function validateFarmAreas(
  input: FarmAreaValidationInput,
): FarmAreaValidationResult {
  const usedArea = input.agriculturalArea + input.vegetationArea;
  const availableArea = input.totalArea - usedArea;

  return {
    isValid: usedArea <= input.totalArea,
    usedArea,
    availableArea,
  };
}
