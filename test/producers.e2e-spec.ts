import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { RequestIdMiddleware } from '../src/common/middlewares/request-id.middleware';
import { PrismaService } from '../src/prisma/prisma.service';
import { api, responseBodyAs } from './helpers/e2e-test-utils';
import { createAppValidationPipe } from '../src/common/pipes/app-validation.pipe';
import {
  ErrorResponse,
  PaginatedResponse,
  ProducerResponse,
} from './helpers/e2e-types';

describe('ProducersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const requestIdMiddleware = new RequestIdMiddleware();

    app.use((req: Request, res: Response, next: NextFunction) => {
      requestIdMiddleware.use(req, res, next);
    });

    app.useGlobalPipes(createAppValidationPipe());

    prisma = app.get(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    await prisma.plantedCrop.deleteMany();
    await prisma.farm.deleteMany();
    await prisma.producer.deleteMany();
    await prisma.crop.deleteMany();
    await prisma.harvest.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a producer with valid CPF', async () => {
    const response = await api(app)
      .post('/producers')
      .set('x-request-id', 'test-create-producer')
      .send({
        document: '529.982.247-25',
        name: 'João da Silva',
      })
      .expect(201);

    const body = responseBodyAs<ProducerResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        document: '52998224725',
        documentType: 'CPF',
        name: 'João da Silva',
        status: 'ACTIVE',
      }),
    );

    expect(body.id).toEqual(expect.any(String));
  });

  it('should reject producer with invalid CPF', async () => {
    const response = await api(app)
      .post('/producers')
      .set('x-request-id', 'test-invalid-cpf')
      .send({
        document: '11111111111',
        name: 'Produtor Inválido',
      })
      .expect(400);

    const body = responseBodyAs<ErrorResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: 'CPF ou CNPJ inválido.',
        path: '/producers',
        method: 'POST',
        requestId: 'test-invalid-cpf',
      }),
    );
  });

  it('should reject duplicated CPF/CNPJ', async () => {
    await api(app).post('/producers').send({
      document: '52998224725',
      name: 'João da Silva',
    });

    const response = await api(app)
      .post('/producers')
      .send({
        document: '529.982.247-25',
        name: 'Outro João',
      })
      .expect(409);

    const body = responseBodyAs<ErrorResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 409,
        message: 'Já existe um produtor cadastrado com este CPF/CNPJ.',
        path: '/producers',
        method: 'POST',
      }),
    );
  });

  it('should list producers with pagination', async () => {
    await api(app).post('/producers').send({
      document: '52998224725',
      name: 'João da Silva',
    });

    await api(app).post('/producers').send({
      document: '93541134780',
      name: 'Maria Oliveira',
    });

    const response = await api(app)
      .get('/producers?page=1&limit=1')
      .expect(200);

    const body = responseBodyAs<PaginatedResponse<ProducerResponse>>(response);

    expect(Array.isArray(body.data)).toBe(true);

    expect(body.meta).toEqual({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
    });

    expect(body.data).toHaveLength(1);
  });

  it('should not list inactive producers', async () => {
    const createResponse = await api(app)
      .post('/producers')
      .send({
        document: '52998224725',
        name: 'João da Silva',
      })
      .expect(201);

    const createdProducer = responseBodyAs<ProducerResponse>(createResponse);

    await api(app).delete(`/producers/${createdProducer.id}`).expect(200);

    const listResponse = await api(app)
      .get('/producers?page=1&limit=10')
      .expect(200);

    const listBody =
      responseBodyAs<PaginatedResponse<ProducerResponse>>(listResponse);

    expect(listBody.meta.total).toBe(0);
    expect(listBody.data).toEqual([]);
  });
});
