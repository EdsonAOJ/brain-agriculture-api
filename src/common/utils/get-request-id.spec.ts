import { Request } from 'express';
import { getRequestId } from './get-request-id';

describe('getRequestId', () => {
  it('should return request id from x-request-id header', () => {
    const request = {
      headers: {
        'x-request-id': 'request-123',
      },
    } as unknown as Request;

    expect(getRequestId(request)).toBe('request-123');
  });

  it('should return first request id when header is an array', () => {
    const request = {
      headers: {
        'x-request-id': ['request-123', 'request-456'],
      },
    } as unknown as Request;

    expect(getRequestId(request)).toBe('request-123');
  });

  it('should return undefined when request id header is missing', () => {
    const request = {
      headers: {},
    } as unknown as Request;

    expect(getRequestId(request)).toBeUndefined();
  });
});
