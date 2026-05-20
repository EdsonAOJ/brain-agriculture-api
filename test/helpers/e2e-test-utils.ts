import { INestApplication } from '@nestjs/common';
import { Response } from 'supertest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import request = require('supertest');

type SupertestApp = Parameters<typeof request>[0];

export function api(app: INestApplication) {
  const server = app.getHttpServer() as unknown as SupertestApp;

  return request(server);
}

export function responseBodyAs<T>(response: Response): T {
  const body: unknown = response.body;

  return body as T;
}
