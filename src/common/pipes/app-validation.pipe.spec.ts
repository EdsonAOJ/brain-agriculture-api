import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { createAppValidationPipe } from './app-validation.pipe';

describe('createAppValidationPipe', () => {
  it('should create a validation pipe instance', () => {
    const pipe = createAppValidationPipe();

    expect(pipe).toBeDefined();
  });

  it('should return the highest priority validation message', () => {
    const pipe = createAppValidationPipe();

    const exceptionFactory = (
      pipe as unknown as {
        exceptionFactory: (errors: ValidationError[]) => BadRequestException;
      }
    ).exceptionFactory;

    const exception = exceptionFactory([
      {
        property: 'name',
        constraints: {
          maxLength: 'O nome deve ter no máximo 80 caracteres.',
          isNotEmpty: 'O nome é obrigatório.',
          isString: 'O nome deve ser um texto.',
        },
      },
    ]);

    const response = exception.getResponse();

    expect(response).toEqual({
      message: ['O nome é obrigatório.'],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should extract validation messages from children', () => {
    const pipe = createAppValidationPipe();

    const exceptionFactory = (
      pipe as unknown as {
        exceptionFactory: (errors: ValidationError[]) => BadRequestException;
      }
    ).exceptionFactory;

    const exception = exceptionFactory([
      {
        property: 'parent',
        children: [
          {
            property: 'child',
            constraints: {
              isUUID: 'O ID deve ser um UUID válido.',
            },
          },
        ],
      },
    ]);

    const response = exception.getResponse();

    expect(response).toEqual({
      message: ['O ID deve ser um UUID válido.'],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should return empty messages when validation error has no constraints and no children', () => {
    const pipe = createAppValidationPipe();

    const exceptionFactory = (
      pipe as unknown as {
        exceptionFactory: (errors: ValidationError[]) => BadRequestException;
      }
    ).exceptionFactory;

    const exception = exceptionFactory([
      {
        property: 'fieldWithoutConstraints',
      },
    ]);

    expect(exception.getResponse()).toEqual({
      message: [],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should return null internally when validation error has no constraints', () => {
    const pipe = createAppValidationPipe();

    const exceptionFactory = (
      pipe as unknown as {
        exceptionFactory: (errors: ValidationError[]) => BadRequestException;
      }
    ).exceptionFactory;

    const exception = exceptionFactory([
      {
        property: 'fieldWithoutConstraints',
        constraints: undefined,
        children: [],
      },
    ]);

    expect(exception.getResponse()).toEqual({
      message: [],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should return empty messages when validation error has empty constraints object', () => {
    const pipe = createAppValidationPipe();

    const exceptionFactory = (
      pipe as unknown as {
        exceptionFactory: (errors: ValidationError[]) => BadRequestException;
      }
    ).exceptionFactory;

    const exception = exceptionFactory([
      {
        property: 'fieldWithEmptyConstraints',
        constraints: {},
        children: [],
      },
    ]);

    expect(exception.getResponse()).toEqual({
      message: [],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should use default empty validation errors array', () => {
    const pipe = createAppValidationPipe();

    const exceptionFactory = (
      pipe as unknown as {
        exceptionFactory: (errors?: ValidationError[]) => BadRequestException;
      }
    ).exceptionFactory;

    const exception = exceptionFactory();

    expect(exception.getResponse()).toEqual({
      message: [],
      error: 'Bad Request',
      statusCode: 400,
    });
  });
});
