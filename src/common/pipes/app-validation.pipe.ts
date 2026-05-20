import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

const constraintPriority = [
  'isNotEmpty',
  'isDefined',
  'isString',
  'isNumber',
  'isInt',
  'isUUID',
  'isEnum',
  'min',
  'max',
  'minLength',
  'maxLength',
];

export function createAppValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    stopAtFirstError: false,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      const messages = extractValidationMessages(validationErrors);

      return new BadRequestException({
        message: messages,
        error: 'Bad Request',
        statusCode: 400,
      });
    },
  });
}

function extractValidationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const currentMessage = getMainConstraintMessage(error);
    const childrenMessages = error.children?.length
      ? extractValidationMessages(error.children)
      : [];

    return [...(currentMessage ? [currentMessage] : []), ...childrenMessages];
  });
}

function getMainConstraintMessage(error: ValidationError): string | null {
  if (!error.constraints) {
    return null;
  }

  for (const constraintName of constraintPriority) {
    const message = error.constraints[constraintName];

    if (message) {
      return message;
    }
  }

  return Object.values(error.constraints)[0] ?? null;
}
