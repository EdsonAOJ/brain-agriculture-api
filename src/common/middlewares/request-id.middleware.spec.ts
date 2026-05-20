import { NextFunction, Request, Response } from 'express';
import {
  REQUEST_ID_HEADER,
  RequestIdMiddleware,
} from './request-id.middleware';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
  });

  it('should reuse existing x-request-id header', () => {
    const request = {
      header: jest.fn(() => 'existing-request-id'),
      headers: {},
    } as unknown as Request;

    const setHeaderMock = jest.fn();

    const response = {
      setHeader: setHeaderMock,
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    middleware.use(request, response, next);

    expect(request.headers[REQUEST_ID_HEADER]).toBe('existing-request-id');
    expect(setHeaderMock).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      'existing-request-id',
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should generate request id when header is missing', () => {
    const request = {
      header: jest.fn(() => undefined),
      headers: {},
    } as unknown as Request;

    const setHeaderMock = jest.fn();

    const response = {
      setHeader: setHeaderMock,
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    middleware.use(request, response, next);

    const generatedRequestId = request.headers[REQUEST_ID_HEADER];

    expect(typeof generatedRequestId).toBe('string');
    expect(setHeaderMock).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      generatedRequestId,
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});
