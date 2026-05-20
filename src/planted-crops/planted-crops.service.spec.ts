import { ConflictException, NotFoundException } from '@nestjs/common';
import { RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PlantedCropsService } from './planted-crops.service';

describe('PlantedCropsService', () => {
  let service: PlantedCropsService;

  const prismaMock = {
    farm: {
      findFirst: jest.fn(),
    },
    harvest: {
      findFirst: jest.fn(),
    },
    crop: {
      findFirst: jest.fn(),
    },
    plantedCrop: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();

    service = new PlantedCropsService(prismaMock as unknown as PrismaService);
  });

  it('should create a planted crop when farm, harvest and crop are active', async () => {
    const dto = {
      harvestId: 'harvest-id',
      cropId: 'crop-id',
    };

    const plantedCrop = {
      id: 'planted-crop-id',
      farmId: 'farm-id',
      harvestId: 'harvest-id',
      cropId: 'crop-id',
      status: RecordStatus.ACTIVE,
      farm: {
        id: 'farm-id',
        producer: {
          id: 'producer-id',
        },
      },
      harvest: {
        id: 'harvest-id',
      },
      crop: {
        id: 'crop-id',
      },
    };

    prismaMock.farm.findFirst.mockResolvedValue({
      id: 'farm-id',
    });

    prismaMock.harvest.findFirst.mockResolvedValue({
      id: 'harvest-id',
    });

    prismaMock.crop.findFirst.mockResolvedValue({
      id: 'crop-id',
    });

    prismaMock.plantedCrop.findFirst.mockResolvedValue(null);
    prismaMock.plantedCrop.create.mockResolvedValue(plantedCrop);

    await expect(service.create('farm-id', dto)).resolves.toEqual(plantedCrop);

    expect(prismaMock.farm.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'farm-id',
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    expect(prismaMock.harvest.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'harvest-id',
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    expect(prismaMock.crop.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'crop-id',
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    expect(prismaMock.plantedCrop.findFirst).toHaveBeenCalledWith({
      where: {
        farmId: 'farm-id',
        harvestId: 'harvest-id',
        cropId: 'crop-id',
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    expect(prismaMock.plantedCrop.create).toHaveBeenCalledWith({
      data: {
        farmId: 'farm-id',
        harvestId: 'harvest-id',
        cropId: 'crop-id',
        status: RecordStatus.ACTIVE,
      },
      include: {
        farm: {
          include: {
            producer: true,
          },
        },
        harvest: true,
        crop: true,
      },
    });
  });

  it('should throw NotFoundException when farm is missing or inactive', async () => {
    prismaMock.farm.findFirst.mockResolvedValue(null);

    await expect(
      service.create('missing-farm-id', {
        harvestId: 'harvest-id',
        cropId: 'crop-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.harvest.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.crop.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.plantedCrop.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when harvest is missing or inactive', async () => {
    prismaMock.farm.findFirst.mockResolvedValue({
      id: 'farm-id',
    });

    prismaMock.harvest.findFirst.mockResolvedValue(null);

    await expect(
      service.create('farm-id', {
        harvestId: 'missing-harvest-id',
        cropId: 'crop-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.crop.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.plantedCrop.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when crop is missing or inactive', async () => {
    prismaMock.farm.findFirst.mockResolvedValue({
      id: 'farm-id',
    });

    prismaMock.harvest.findFirst.mockResolvedValue({
      id: 'harvest-id',
    });

    prismaMock.crop.findFirst.mockResolvedValue(null);

    await expect(
      service.create('farm-id', {
        harvestId: 'harvest-id',
        cropId: 'missing-crop-id',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.plantedCrop.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when planted crop already exists for farm, harvest and crop', async () => {
    prismaMock.farm.findFirst.mockResolvedValue({
      id: 'farm-id',
    });

    prismaMock.harvest.findFirst.mockResolvedValue({
      id: 'harvest-id',
    });

    prismaMock.crop.findFirst.mockResolvedValue({
      id: 'crop-id',
    });

    prismaMock.plantedCrop.findFirst.mockResolvedValue({
      id: 'existing-planted-crop-id',
    });

    await expect(
      service.create('farm-id', {
        harvestId: 'harvest-id',
        cropId: 'crop-id',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.plantedCrop.create).not.toHaveBeenCalled();
  });

  it('should list planted crops by farm with pagination and filters', async () => {
    const plantedCrops = [
      {
        id: 'planted-crop-id',
        farmId: 'farm-id',
        harvestId: 'harvest-id',
        cropId: 'crop-id',
        status: RecordStatus.ACTIVE,
        harvest: {
          id: 'harvest-id',
        },
        crop: {
          id: 'crop-id',
        },
        farm: {
          id: 'farm-id',
          producer: {
            id: 'producer-id',
          },
        },
      },
    ];

    prismaMock.farm.findFirst.mockResolvedValue({
      id: 'farm-id',
    });

    prismaMock.plantedCrop.findMany.mockResolvedValue(plantedCrops);
    prismaMock.plantedCrop.count.mockResolvedValue(1);

    await expect(
      service.findAllByFarm('farm-id', {
        page: 1,
        limit: 10,
        cropId: 'crop-id',
        harvestId: 'harvest-id',
      }),
    ).resolves.toEqual({
      data: plantedCrops,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(prismaMock.plantedCrop.findMany).toHaveBeenCalledWith({
      where: {
        farmId: 'farm-id',
        status: RecordStatus.ACTIVE,
        cropId: 'crop-id',
        harvestId: 'harvest-id',
      },
      skip: 0,
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        harvest: true,
        crop: true,
        farm: {
          include: {
            producer: true,
          },
        },
      },
    });

    expect(prismaMock.plantedCrop.count).toHaveBeenCalledWith({
      where: {
        farmId: 'farm-id',
        status: RecordStatus.ACTIVE,
        cropId: 'crop-id',
        harvestId: 'harvest-id',
      },
    });
  });

  it('should throw NotFoundException when listing planted crops for missing or inactive farm', async () => {
    prismaMock.farm.findFirst.mockResolvedValue(null);

    await expect(
      service.findAllByFarm('missing-farm-id', {
        page: 1,
        limit: 10,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.plantedCrop.findMany).not.toHaveBeenCalled();
    expect(prismaMock.plantedCrop.count).not.toHaveBeenCalled();
  });

  it('should find one active planted crop by id', async () => {
    const plantedCrop = {
      id: 'planted-crop-id',
      farmId: 'farm-id',
      harvestId: 'harvest-id',
      cropId: 'crop-id',
      status: RecordStatus.ACTIVE,
      harvest: {
        id: 'harvest-id',
      },
      crop: {
        id: 'crop-id',
      },
      farm: {
        id: 'farm-id',
        producer: {
          id: 'producer-id',
        },
      },
    };

    prismaMock.plantedCrop.findFirst.mockResolvedValue(plantedCrop);

    await expect(service.findOne('planted-crop-id')).resolves.toEqual(
      plantedCrop,
    );

    expect(prismaMock.plantedCrop.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'planted-crop-id',
        status: RecordStatus.ACTIVE,
      },
      include: {
        harvest: true,
        crop: true,
        farm: {
          include: {
            producer: true,
          },
        },
      },
    });
  });

  it('should throw NotFoundException when planted crop is not found', async () => {
    prismaMock.plantedCrop.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne('missing-planted-crop-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should inactivate an active planted crop', async () => {
    prismaMock.plantedCrop.findUnique.mockResolvedValue({
      id: 'planted-crop-id',
      status: RecordStatus.ACTIVE,
    });

    prismaMock.plantedCrop.update.mockResolvedValue({
      id: 'planted-crop-id',
      status: RecordStatus.INACTIVE,
      inactiveAt: new Date(),
    });

    await expect(service.remove('planted-crop-id')).resolves.toEqual({
      message: 'Cultura plantada inativada com sucesso.',
    });

    const anyDateMatcher = expect.any(Date) as unknown as Date;

    expect(prismaMock.plantedCrop.update).toHaveBeenCalledWith({
      where: {
        id: 'planted-crop-id',
      },
      data: {
        status: RecordStatus.INACTIVE,
        inactiveAt: anyDateMatcher,
      },
    });
  });

  it('should return message when planted crop is already inactive', async () => {
    prismaMock.plantedCrop.findUnique.mockResolvedValue({
      id: 'planted-crop-id',
      status: RecordStatus.INACTIVE,
    });

    await expect(service.remove('planted-crop-id')).resolves.toEqual({
      message: 'Cultura plantada já estava inativa.',
    });

    expect(prismaMock.plantedCrop.update).not.toHaveBeenCalled();
  });

  it('should list planted crops by farm without optional filters', async () => {
    const plantedCrops = [
      {
        id: 'planted-crop-id',
        farmId: 'farm-id',
        harvestId: 'harvest-id',
        cropId: 'crop-id',
        status: RecordStatus.ACTIVE,
        harvest: {
          id: 'harvest-id',
        },
        crop: {
          id: 'crop-id',
        },
        farm: {
          id: 'farm-id',
          producer: {
            id: 'producer-id',
          },
        },
      },
    ];

    prismaMock.farm.findFirst.mockResolvedValue({
      id: 'farm-id',
    });

    prismaMock.plantedCrop.findMany.mockResolvedValue(plantedCrops);
    prismaMock.plantedCrop.count.mockResolvedValue(1);

    await expect(
      service.findAllByFarm('farm-id', {
        page: 1,
        limit: 10,
      }),
    ).resolves.toEqual({
      data: plantedCrops,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(prismaMock.plantedCrop.findMany).toHaveBeenCalledWith({
      where: {
        farmId: 'farm-id',
        status: RecordStatus.ACTIVE,
      },
      skip: 0,
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        harvest: true,
        crop: true,
        farm: {
          include: {
            producer: true,
          },
        },
      },
    });

    expect(prismaMock.plantedCrop.count).toHaveBeenCalledWith({
      where: {
        farmId: 'farm-id',
        status: RecordStatus.ACTIVE,
      },
    });
  });

  it('should throw NotFoundException when removing missing planted crop', async () => {
    prismaMock.plantedCrop.findUnique.mockResolvedValue(null);

    await expect(
      service.remove('missing-planted-crop-id'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.plantedCrop.update).not.toHaveBeenCalled();
  });
});
