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
  ErrorResponse,
  FarmResponse,
  HarvestResponse,
  PaginatedResponse,
  PlantedCropResponse,
  ProducerResponse,
} from './helpers/e2e-types';

interface TestScenario {
  producer: ProducerResponse;
  farm: FarmResponse;
  harvest: HarvestResponse;
  crop: CropResponse;
}

describe('PlantedCropsController (e2e)', () => {
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

  async function createScenario(): Promise<TestScenario> {
    const producerResponse = await api(app)
      .post('/producers')
      .send({
        document: '935.411.347-80',
        name: 'Maria Oliveira',
      })
      .expect(201);

    const producer = responseBodyAs<ProducerResponse>(producerResponse);

    const farmResponse = await api(app)
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

    const farm = responseBodyAs<FarmResponse>(farmResponse);

    const harvestResponse = await api(app)
      .post('/harvests')
      .send({
        name: 'Safra 2021',
      })
      .expect(201);

    const harvest = responseBodyAs<HarvestResponse>(harvestResponse);

    const cropResponse = await api(app)
      .post('/crops')
      .send({
        name: 'Soja',
      })
      .expect(201);

    const crop = responseBodyAs<CropResponse>(cropResponse);

    return {
      producer,
      farm,
      harvest,
      crop,
    };
  }

  it('should register a planted crop for an active farm, harvest and crop', async () => {
    const { farm, harvest, crop } = await createScenario();

    const response = await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(201);

    const body = responseBodyAs<PlantedCropResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        farmId: farm.id,
        harvestId: harvest.id,
        cropId: crop.id,
        status: 'ACTIVE',
      }),
    );

    expect(body.id).toEqual(expect.any(String));
    expect(body.crop?.name).toBe('Soja');
    expect(body.harvest?.name).toBe('Safra 2021');
  });

  it('should reject duplicated active planted crop for same farm, harvest and crop', async () => {
    const { farm, harvest, crop } = await createScenario();

    await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(201);

    const response = await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(409);

    const body = responseBodyAs<ErrorResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 409,
        message:
          'Esta cultura já está registrada para esta fazenda nesta safra.',
        method: 'POST',
      }),
    );
  });

  it('should allow registering the same farm, harvest and crop again after soft delete', async () => {
    const { farm, harvest, crop } = await createScenario();

    const createResponse = await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(201);

    const createdPlantedCrop =
      responseBodyAs<PlantedCropResponse>(createResponse);

    await api(app)
      .delete(`/planted-crops/${createdPlantedCrop.id}`)
      .expect(200);

    const recreateResponse = await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(201);

    const recreatedPlantedCrop =
      responseBodyAs<PlantedCropResponse>(recreateResponse);

    expect(recreatedPlantedCrop).toEqual(
      expect.objectContaining({
        farmId: farm.id,
        harvestId: harvest.id,
        cropId: crop.id,
        status: 'ACTIVE',
      }),
    );

    expect(recreatedPlantedCrop.id).not.toBe(createdPlantedCrop.id);
  });

  it('should reject planted crop creation for inactive farm', async () => {
    const { farm, harvest, crop } = await createScenario();

    await api(app).delete(`/farms/${farm.id}`).expect(200);

    const response = await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(404);

    const body = responseBodyAs<ErrorResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'Fazenda não encontrada ou inativa.',
        method: 'POST',
      }),
    );
  });

  it('should reject planted crop creation for inactive harvest', async () => {
    const { farm, harvest, crop } = await createScenario();

    await api(app).delete(`/harvests/${harvest.id}`).expect(200);

    const response = await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(404);

    const body = responseBodyAs<ErrorResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'Safra não encontrada ou inativa.',
        method: 'POST',
      }),
    );
  });

  it('should reject planted crop creation for inactive crop', async () => {
    const { farm, harvest, crop } = await createScenario();

    await api(app).delete(`/crops/${crop.id}`).expect(200);

    const response = await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(404);

    const body = responseBodyAs<ErrorResponse>(response);

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'Cultura não encontrada ou inativa.',
        method: 'POST',
      }),
    );
  });

  it('should list planted crops by farm with pagination', async () => {
    const { farm, harvest, crop } = await createScenario();

    const secondCropResponse = await api(app)
      .post('/crops')
      .send({
        name: 'Milho',
      })
      .expect(201);

    const secondCrop = responseBodyAs<CropResponse>(secondCropResponse);

    await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(201);

    await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: secondCrop.id,
      })
      .expect(201);

    const response = await api(app)
      .get(`/farms/${farm.id}/planted-crops?page=1&limit=1`)
      .expect(200);

    const body =
      responseBodyAs<PaginatedResponse<PlantedCropResponse>>(response);

    expect(Array.isArray(body.data)).toBe(true);

    expect(body.meta).toEqual({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
    });

    expect(body.data).toHaveLength(1);
  });

  it('should filter planted crops by cropId and harvestId', async () => {
    const { farm, harvest, crop } = await createScenario();

    const secondCropResponse = await api(app)
      .post('/crops')
      .send({
        name: 'Milho',
      })
      .expect(201);

    const secondCrop = responseBodyAs<CropResponse>(secondCropResponse);

    await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(201);

    await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: secondCrop.id,
      })
      .expect(201);

    const response = await api(app)
      .get(
        `/farms/${farm.id}/planted-crops?page=1&limit=10&cropId=${crop.id}&harvestId=${harvest.id}`,
      )
      .expect(200);

    const body =
      responseBodyAs<PaginatedResponse<PlantedCropResponse>>(response);

    expect(body.meta.total).toBe(1);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toEqual(
      expect.objectContaining({
        farmId: farm.id,
        harvestId: harvest.id,
        cropId: crop.id,
      }),
    );
  });

  it('should not list inactive planted crops', async () => {
    const { farm, harvest, crop } = await createScenario();

    const createResponse = await api(app)
      .post(`/farms/${farm.id}/planted-crops`)
      .send({
        harvestId: harvest.id,
        cropId: crop.id,
      })
      .expect(201);

    const plantedCrop = responseBodyAs<PlantedCropResponse>(createResponse);

    await api(app).delete(`/planted-crops/${plantedCrop.id}`).expect(200);

    const response = await api(app)
      .get(`/farms/${farm.id}/planted-crops?page=1&limit=10`)
      .expect(200);

    const body =
      responseBodyAs<PaginatedResponse<PlantedCropResponse>>(response);

    expect(body.meta.total).toBe(0);
    expect(body.data).toEqual([]);
  });
});
