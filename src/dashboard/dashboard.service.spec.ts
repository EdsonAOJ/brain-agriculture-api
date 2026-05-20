import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const prismaMock = {
    farm: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    plantedCrop: {
      groupBy: jest.fn(),
    },
    crop: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should return dashboard summary with farms, hectares, states, crops and land use', async () => {
    prismaMock.farm.count.mockResolvedValue(4);

    prismaMock.farm.aggregate.mockResolvedValue({
      _sum: {
        totalArea: 5900,
        agriculturalArea: 4050,
        vegetationArea: 1350,
      },
    });

    prismaMock.farm.groupBy.mockResolvedValue([
      {
        state: 'GO',
        _count: {
          id: 1,
        },
      },
      {
        state: 'MT',
        _count: {
          id: 2,
        },
      },
    ]);

    prismaMock.plantedCrop.groupBy.mockResolvedValue([
      {
        cropId: 'crop-soja-id',
        _count: {
          id: 4,
        },
      },
      {
        cropId: 'crop-milho-id',
        _count: {
          id: 2,
        },
      },
    ]);

    prismaMock.crop.findMany.mockResolvedValue([
      {
        id: 'crop-soja-id',
        name: 'Soja',
      },
      {
        id: 'crop-milho-id',
        name: 'Milho',
      },
    ]);

    const result = await service.getSummary();

    expect(result).toEqual({
      totalFarms: 4,
      totalHectares: 5900,
      farmsByState: [
        {
          state: 'GO',
          total: 1,
        },
        {
          state: 'MT',
          total: 2,
        },
      ],
      farmsByCrop: [
        {
          crop: 'Milho',
          total: 2,
        },
        {
          crop: 'Soja',
          total: 4,
        },
      ],
      landUse: {
        agriculturalArea: 4050,
        vegetationArea: 1350,
      },
    });
  });

  it('should return zero values when there are no farms or planted crops', async () => {
    prismaMock.farm.count.mockResolvedValue(0);

    prismaMock.farm.aggregate.mockResolvedValue({
      _sum: {
        totalArea: null,
        agriculturalArea: null,
        vegetationArea: null,
      },
    });

    prismaMock.farm.groupBy.mockResolvedValue([]);
    prismaMock.plantedCrop.groupBy.mockResolvedValue([]);

    const result = await service.getSummary();

    expect(result).toEqual({
      totalFarms: 0,
      totalHectares: 0,
      farmsByState: [],
      farmsByCrop: [],
      landUse: {
        agriculturalArea: 0,
        vegetationArea: 0,
      },
    });

    expect(prismaMock.crop.findMany).not.toHaveBeenCalled();
  });
});
