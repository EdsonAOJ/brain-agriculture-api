import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { RequestIdMiddleware } from '../src/common/middlewares/request-id.middleware';
import { PrismaService } from '../src/prisma/prisma.service';
import { api, responseBodyAs } from './helpers/e2e-test-utils';
import { createAppValidationPipe } from '../src/common/pipes/app-validation.pipe';
import {
  CropResponse,
  DashboardSummaryResponse,
  FarmResponse,
  HarvestResponse,
  ProducerResponse,
} from './helpers/e2e-types';

describe('DashboardController (e2e)', () => {
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

  async function createProducer(params: {
    document: string;
    name: string;
  }): Promise<ProducerResponse> {
    const response = await api(app)
      .post('/producers')
      .send({
        document: params.document,
        name: params.name,
      })
      .expect(201);

    return responseBodyAs<ProducerResponse>(response);
  }

  async function createFarm(params: {
    producerId: string;
    name: string;
    city: string;
    state: string;
    totalArea: number;
    agriculturalArea: number;
    vegetationArea: number;
  }): Promise<FarmResponse> {
    const response = await api(app)
      .post(`/producers/${params.producerId}/farms`)
      .send({
        name: params.name,
        city: params.city,
        state: params.state,
        totalArea: params.totalArea,
        agriculturalArea: params.agriculturalArea,
        vegetationArea: params.vegetationArea,
      })
      .expect(201);

    return responseBodyAs<FarmResponse>(response);
  }

  async function createHarvest(name: string): Promise<HarvestResponse> {
    const response = await api(app)
      .post('/harvests')
      .send({
        name,
      })
      .expect(201);

    return responseBodyAs<HarvestResponse>(response);
  }

  async function createCrop(name: string): Promise<CropResponse> {
    const response = await api(app)
      .post('/crops')
      .send({
        name,
      })
      .expect(201);

    return responseBodyAs<CropResponse>(response);
  }

  async function registerPlantedCrop(params: {
    farmId: string;
    harvestId: string;
    cropId: string;
  }): Promise<void> {
    await api(app)
      .post(`/farms/${params.farmId}/planted-crops`)
      .send({
        harvestId: params.harvestId,
        cropId: params.cropId,
      })
      .expect(201);
  }

  it('should return empty dashboard summary when there is no data', async () => {
    const response = await api(app).get('/dashboard/summary').expect(200);

    const body = responseBodyAs<DashboardSummaryResponse>(response);

    expect(body).toEqual({
      totalFarms: 0,
      totalHectares: 0,
      farmsByState: [],
      farmsByCrop: [],
      landUse: {
        agriculturalArea: 0,
        vegetationArea: 0,
      },
    });
  });

  it('should return dashboard summary with farms, hectares, states, crops and land use', async () => {
    const producerOne = await createProducer({
      document: '529.982.247-25',
      name: 'João da Silva',
    });

    const producerTwo = await createProducer({
      document: '935.411.347-80',
      name: 'Maria Oliveira',
    });

    const farmOne = await createFarm({
      producerId: producerOne.id,
      name: 'Fazenda Boa Vista',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 250,
    });

    const farmTwo = await createFarm({
      producerId: producerOne.id,
      name: 'Fazenda Santa Clara',
      city: 'Sorriso',
      state: 'MT',
      totalArea: 2500,
      agriculturalArea: 1800,
      vegetationArea: 500,
    });

    const farmThree = await createFarm({
      producerId: producerTwo.id,
      name: 'Fazenda Primavera',
      city: 'Rio Verde',
      state: 'GO',
      totalArea: 1800,
      agriculturalArea: 1200,
      vegetationArea: 400,
    });

    const harvest2021 = await createHarvest('Safra 2021');
    const harvest2022 = await createHarvest('Safra 2022');

    const soja = await createCrop('Soja');
    const milho = await createCrop('Milho');
    const cafe = await createCrop('Café');

    await registerPlantedCrop({
      farmId: farmOne.id,
      harvestId: harvest2021.id,
      cropId: soja.id,
    });

    await registerPlantedCrop({
      farmId: farmOne.id,
      harvestId: harvest2021.id,
      cropId: milho.id,
    });

    await registerPlantedCrop({
      farmId: farmTwo.id,
      harvestId: harvest2022.id,
      cropId: soja.id,
    });

    await registerPlantedCrop({
      farmId: farmThree.id,
      harvestId: harvest2022.id,
      cropId: cafe.id,
    });

    const response = await api(app).get('/dashboard/summary').expect(200);

    const body = responseBodyAs<DashboardSummaryResponse>(response);

    expect(body.totalFarms).toBe(3);
    expect(body.totalHectares).toBe(5300);

    expect(body.landUse).toEqual({
      agriculturalArea: 3700,
      vegetationArea: 1150,
    });

    expect(body.farmsByState).toEqual([
      {
        state: 'GO',
        total: 1,
      },
      {
        state: 'MT',
        total: 1,
      },
      {
        state: 'SP',
        total: 1,
      },
    ]);

    expect(body.farmsByCrop).toEqual([
      {
        crop: 'Café',
        total: 1,
      },
      {
        crop: 'Milho',
        total: 1,
      },
      {
        crop: 'Soja',
        total: 2,
      },
    ]);
  });

  it('should ignore inactive farms in dashboard summary', async () => {
    const producer = await createProducer({
      document: '529.982.247-25',
      name: 'João da Silva',
    });

    const activeFarm = await createFarm({
      producerId: producer.id,
      name: 'Fazenda Ativa',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 250,
    });

    const inactiveFarm = await createFarm({
      producerId: producer.id,
      name: 'Fazenda Inativa',
      city: 'Sorriso',
      state: 'MT',
      totalArea: 2000,
      agriculturalArea: 1500,
      vegetationArea: 300,
    });

    await api(app).delete(`/farms/${inactiveFarm.id}`).expect(200);

    const harvest = await createHarvest('Safra 2021');
    const crop = await createCrop('Soja');

    await registerPlantedCrop({
      farmId: activeFarm.id,
      harvestId: harvest.id,
      cropId: crop.id,
    });

    const response = await api(app).get('/dashboard/summary').expect(200);

    const body = responseBodyAs<DashboardSummaryResponse>(response);

    expect(body.totalFarms).toBe(1);
    expect(body.totalHectares).toBe(1000);

    expect(body.farmsByState).toEqual([
      {
        state: 'SP',
        total: 1,
      },
    ]);

    expect(body.landUse).toEqual({
      agriculturalArea: 700,
      vegetationArea: 250,
    });
  });
});
