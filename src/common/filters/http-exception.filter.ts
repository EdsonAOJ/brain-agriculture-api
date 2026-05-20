import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { getRequestId } from '../utils/get-request-id';

interface ExceptionResponseObject {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const responseBody =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ExceptionResponseObject)
        : null;

    const message =
      responseBody?.message ??
      (typeof exceptionResponse === 'string'
        ? exceptionResponse
        : 'Erro interno no servidor.');

    const error =
      responseBody?.error ??
      (exception instanceof HttpException
        ? exception.name
        : 'Internal Server Error');

    const requestId = getRequestId(request);

    const payload = {
      statusCode,
      message,
      error,
      path: request.originalUrl,
      method: request.method,
      timestamp: new Date().toISOString(),
      requestId,
    };

    if (statusCode >= 500) {
      this.logger.error(
        `Unhandled error. requestId=${requestId} method=${request.method} path=${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `HTTP error. requestId=${requestId} statusCode=${statusCode} method=${request.method} path=${request.originalUrl}`,
      );
    }

    response.status(statusCode).json(payload);
  }
}
