import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

type ResponseMock = {
  status: jest.Mock<ResponseMock, [number]>;
  json: jest.Mock<ResponseMock, [unknown]>;
};

function createResponseMock(): ResponseMock {
  const response = {} as ResponseMock;

  response.status = jest.fn<ResponseMock, [number]>().mockReturnValue(response);
  response.json = jest.fn<ResponseMock, [unknown]>().mockReturnValue(response);

  return response;
}

function createArgumentsHostMock(params: {
  request: Partial<Request>;
  response: ResponseMock;
}): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => params.response as unknown as Response,
      getRequest: () => params.request as Request,
    }),
  } as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    loggerWarnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
    loggerWarnSpy.mockRestore();
  });

  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should format BadRequestException response', () => {
    const response = createResponseMock();

    const request: Partial<Request> = {
      originalUrl: '/producers',
      method: 'POST',
      headers: {
        'x-request-id': 'test-request-id',
      },
    };

    const host = createArgumentsHostMock({
      request,
      response,
    });

    const exception = new BadRequestException({
      message: ['CPF ou CNPJ inválido.'],
      error: 'Bad Request',
      statusCode: 400,
    });

    filter.catch(exception, host);

    const anyStringMatcher = expect.any(String) as unknown as string;

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: ['CPF ou CNPJ inválido.'],
      error: 'Bad Request',
      path: '/producers',
      method: 'POST',
      timestamp: anyStringMatcher,
      requestId: 'test-request-id',
    });
  });

  it('should format HttpException with string response', () => {
    const response = createResponseMock();

    const request: Partial<Request> = {
      originalUrl: '/custom',
      method: 'GET',
      headers: {
        'x-request-id': 'custom-request-id',
      },
    };

    const host = createArgumentsHostMock({
      request,
      response,
    });

    const exception = new HttpException(
      'Custom error',
      HttpStatus.I_AM_A_TEAPOT,
    );

    filter.catch(exception, host);

    const anyStringMatcher = expect.any(String) as unknown as string;

    expect(response.status).toHaveBeenCalledWith(HttpStatus.I_AM_A_TEAPOT);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.I_AM_A_TEAPOT,
      message: 'Custom error',
      error: 'HttpException',
      path: '/custom',
      method: 'GET',
      timestamp: anyStringMatcher,
      requestId: 'custom-request-id',
    });
  });

  it('should format unexpected errors as internal server error', () => {
    const response = createResponseMock();

    const request: Partial<Request> = {
      originalUrl: '/unexpected',
      method: 'GET',
      headers: {
        'x-request-id': 'unexpected-request-id',
      },
    };

    const host = createArgumentsHostMock({
      request,
      response,
    });

    filter.catch(new Error('Unexpected error'), host);

    const anyStringMatcher = expect.any(String) as unknown as string;

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno no servidor.',
      error: 'Internal Server Error',
      path: '/unexpected',
      method: 'GET',
      timestamp: anyStringMatcher,
      requestId: 'unexpected-request-id',
    });
  });

  it('should format non-error unexpected exceptions as internal server error', () => {
    const response = createResponseMock();

    const request: Partial<Request> = {
      originalUrl: '/unexpected-string',
      method: 'GET',
      headers: {
        'x-request-id': 'unexpected-string-request-id',
      },
    };

    const host = createArgumentsHostMock({
      request,
      response,
    });

    filter.catch('Unexpected string error', host);

    const anyStringMatcher = expect.any(String) as unknown as string;

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno no servidor.',
      error: 'Internal Server Error',
      path: '/unexpected-string',
      method: 'GET',
      timestamp: anyStringMatcher,
      requestId: 'unexpected-string-request-id',
    });
  });
});
