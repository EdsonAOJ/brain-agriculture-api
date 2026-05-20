import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export async function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  payload: object,
): Promise<ValidationError[]> {
  const dto = plainToInstance(dtoClass, payload);

  return validate(dto);
}

export function getValidationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const constraints = error.constraints;

    if (!constraints) {
      return [];
    }

    return Object.values(constraints);
  });
}
