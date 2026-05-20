import { Request } from 'express';
import { REQUEST_ID_HEADER } from '../middlewares/request-id.middleware';

export function getRequestId(request: Request): string | undefined {
  const requestId = request.headers[REQUEST_ID_HEADER];

  if (Array.isArray(requestId)) {
    return requestId[0];
  }

  return requestId;
}
