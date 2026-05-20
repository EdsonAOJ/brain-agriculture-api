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
  FarmResponse,
  PaginatedResponse,
  ProducerResponse,
} from './helpers/e2e-types';

describe('FarmsController (e2e)', () => {
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

  async function createProducer(): Promise<ProducerResponse> {
    const response = await api(app)
      .post('/producers')
      .send({
        document: '935.411.347-80',
        name: 'Maria Oliveira',
      })
      .expect(201);

    return responseBodyAs<ProducerResponse>(response);
  }

  it('should create a farm for an active producer', async () => {
    const producer = await createProducer();

    const response = await api(app)
      .post(`/producers/${producer.id}/farms`)
      .send({
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'sp',
        totalArea: 1000,
        agriculturalArea: 700,
        vegetationArea: 250,
      })
      .expect(201);

    const body = responseBodyAs<FarmResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        status: 'ACTIVE',
      }),
    );

    expect(Number(body.totalArea)).toBe(1000);
    expect(Number(body.agriculturalArea)).toBe(700);
    expect(Number(body.vegetationArea)).toBe(250);
    expect(body.producerId).toBe(producer.id);
  });

  it('should reject farm when agricultural area plus vegetation area exceeds total area', async () => {
    const producer = await createProducer();

    const response = await api(app)
      .post(`/producers/${producer.id}/farms`)
      .set('x-request-id', 'test-invalid-area')
      .send({
        name: 'Fazenda Inválida',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1000,
        agriculturalArea: 800,
        vegetationArea: 300,
      })
      .expect(400);

    const body = responseBodyAs<ErrorResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        message:
          'A soma da área agricultável e da área de vegetação não pode ultrapassar a área total da fazenda.',
        path: `/producers/${producer.id}/farms`,
        method: 'POST',
        requestId: 'test-invalid-area',
      }),
    );
  });

  it('should reject farm creation for inactive producer', async () => {
    const producer = await createProducer();

    await api(app).delete(`/producers/${producer.id}`).expect(200);

    const response = await api(app)
      .post(`/producers/${producer.id}/farms`)
      .send({
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1000,
        agriculturalArea: 700,
        vegetationArea: 250,
      })
      .expect(404);

    const body = responseBodyAs<ErrorResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'Produtor não encontrado ou inativo.',
        method: 'POST',
      }),
    );
  });

  it('should list farms by producer with pagination', async () => {
    const producer = await createProducer();

    await api(app)
      .post(`/producers/${producer.id}/farms`)
      .send({
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1000,
        agriculturalArea: 700,
        vegetationArea: 250,
      })
      .expect(201);

    await api(app)
      .post(`/producers/${producer.id}/farms`)
      .send({
        name: 'Fazenda Santa Clara',
        city: 'Sorriso',
        state: 'MT',
        totalArea: 2000,
        agriculturalArea: 1500,
        vegetationArea: 300,
      })
      .expect(201);

    const response = await api(app)
      .get(`/producers/${producer.id}/farms?page=1&limit=1`)
      .expect(200);

    const body = responseBodyAs<PaginatedResponse<FarmResponse>>(response);

    expect(Array.isArray(body.data)).toBe(true);

    expect(body.meta).toEqual({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
    });

    expect(body.data).toHaveLength(1);
  });

  it('should filter farms by state', async () => {
    const producer = await createProducer();

    await api(app)
      .post(`/producers/${producer.id}/farms`)
      .send({
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1000,
        agriculturalArea: 700,
        vegetationArea: 250,
      })
      .expect(201);

    await api(app)
      .post(`/producers/${producer.id}/farms`)
      .send({
        name: 'Fazenda Santa Clara',
        city: 'Sorriso',
        state: 'MT',
        totalArea: 2000,
        agriculturalArea: 1500,
        vegetationArea: 300,
      })
      .expect(201);

    const response = await api(app)
      .get(`/producers/${producer.id}/farms?page=1&limit=10&state=SP`)
      .expect(200);

    const body = responseBodyAs<PaginatedResponse<FarmResponse>>(response);

    expect(body.meta.total).toBe(1);
    expect(body.data[0]).toEqual(
      expect.objectContaining({
        state: 'SP',
      }),
    );
  });

  it('should not list inactive farms', async () => {
    const producer = await createProducer();

    const createFarmResponse = await api(app)
      .post(`/producers/${producer.id}/farms`)
      .send({
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1000,
        agriculturalArea: 700,
        vegetationArea: 250,
      })
      .expect(201);

    const createdFarm = responseBodyAs<FarmResponse>(createFarmResponse);

    await api(app).delete(`/farms/${createdFarm.id}`).expect(200);

    const response = await api(app)
      .get(`/producers/${producer.id}/farms?page=1&limit=10`)
      .expect(200);

    const body = responseBodyAs<PaginatedResponse<FarmResponse>>(response);

    expect(body.meta.total).toBe(0);
    expect(body.data).toEqual([]);
  });
});
