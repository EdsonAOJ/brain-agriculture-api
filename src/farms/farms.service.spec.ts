import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FarmsService } from './farms.service';

describe('FarmsService', () => {
  let service: FarmsService;

  const prismaMock = {
    producer: {
      findFirst: jest.fn(),
    },
    farm: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();

    service = new FarmsService(prismaMock as unknown as PrismaService);
  });

  it('should create a farm for an active producer', async () => {
    const dto = {
      name: ' Fazenda Boa Vista ',
      city: ' Ribeirão Preto ',
      state: ' sp ',
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 250,
    };

    const farm = {
      id: 'farm-id',
      producerId: 'producer-id',
      name: 'Fazenda Boa Vista',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: new Prisma.Decimal(1000),
      agriculturalArea: new Prisma.Decimal(700),
      vegetationArea: new Prisma.Decimal(250),
      status: RecordStatus.ACTIVE,
      producer: {
        id: 'producer-id',
      },
    };

    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    prismaMock.farm.create.mockResolvedValue(farm);

    await expect(service.create('producer-id', dto)).resolves.toEqual(farm);

    const anyDecimalMatcher = expect.any(
      Prisma.Decimal,
    ) as unknown as Prisma.Decimal;

    expect(prismaMock.producer.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'producer-id',
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    expect(prismaMock.farm.create).toHaveBeenCalledWith({
      data: {
        producerId: 'producer-id',
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: anyDecimalMatcher,
        agriculturalArea: anyDecimalMatcher,
        vegetationArea: anyDecimalMatcher,
        status: RecordStatus.ACTIVE,
      },
      include: {
        producer: true,
      },
    });
  });

  it('should throw NotFoundException when creating farm for missing or inactive producer', async () => {
    prismaMock.producer.findFirst.mockResolvedValue(null);

    await expect(
      service.create('missing-producer-id', {
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1000,
        agriculturalArea: 700,
        vegetationArea: 250,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.farm.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when creating farm with invalid area rule', async () => {
    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    await expect(
      service.create('producer-id', {
        name: 'Fazenda Inválida',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1000,
        agriculturalArea: 800,
        vegetationArea: 300,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.farm.create).not.toHaveBeenCalled();
  });

  it('should list active farms by producer with pagination and filters', async () => {
    const farms = [
      {
        id: 'farm-id',
        producerId: 'producer-id',
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        status: RecordStatus.ACTIVE,
        plantedCrops: [],
      },
    ];

    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    prismaMock.farm.findMany.mockResolvedValue(farms);
    prismaMock.farm.count.mockResolvedValue(1);

    await expect(
      service.findAllByProducer('producer-id', {
        page: 1,
        limit: 10,
        search: 'boa',
        state: 'sp',
      }),
    ).resolves.toEqual({
      data: farms,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(prismaMock.farm.findMany).toHaveBeenCalledWith({
      where: {
        producerId: 'producer-id',
        status: RecordStatus.ACTIVE,
        OR: [
          {
            name: {
              contains: 'boa',
              mode: 'insensitive',
            },
          },
          {
            city: {
              contains: 'boa',
              mode: 'insensitive',
            },
          },
        ],
        state: 'SP',
      },
      skip: 0,
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        plantedCrops: {
          where: {
            status: RecordStatus.ACTIVE,
          },
          include: {
            crop: true,
            harvest: true,
          },
        },
      },
    });

    expect(prismaMock.farm.count).toHaveBeenCalledWith({
      where: {
        producerId: 'producer-id',
        status: RecordStatus.ACTIVE,
        OR: [
          {
            name: {
              contains: 'boa',
              mode: 'insensitive',
            },
          },
          {
            city: {
              contains: 'boa',
              mode: 'insensitive',
            },
          },
        ],
        state: 'SP',
      },
    });
  });

  it('should find one active farm by id', async () => {
    const farm = {
      id: 'farm-id',
      producerId: 'producer-id',
      name: 'Fazenda Boa Vista',
      status: RecordStatus.ACTIVE,
      producer: {
        id: 'producer-id',
      },
      plantedCrops: [],
    };

    prismaMock.farm.findFirst.mockResolvedValue(farm);

    await expect(service.findOne('farm-id')).resolves.toEqual(farm);

    expect(prismaMock.farm.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'farm-id',
        status: RecordStatus.ACTIVE,
      },
      include: {
        producer: true,
        plantedCrops: {
          where: {
            status: RecordStatus.ACTIVE,
          },
          include: {
            crop: true,
            harvest: true,
          },
        },
      },
    });
  });

  it('should throw NotFoundException when farm is not found', async () => {
    prismaMock.farm.findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-farm-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should update an active farm', async () => {
    const currentFarm = {
      id: 'farm-id',
      totalArea: new Prisma.Decimal(1000),
      agriculturalArea: new Prisma.Decimal(700),
      vegetationArea: new Prisma.Decimal(250),
      status: RecordStatus.ACTIVE,
    };

    const updatedFarm = {
      id: 'farm-id',
      name: 'Fazenda Atualizada',
      city: 'Campinas',
      state: 'SP',
      totalArea: new Prisma.Decimal(1200),
      agriculturalArea: new Prisma.Decimal(800),
      vegetationArea: new Prisma.Decimal(300),
      status: RecordStatus.ACTIVE,
      producer: {
        id: 'producer-id',
      },
    };

    prismaMock.farm.findFirst.mockResolvedValue(currentFarm);
    prismaMock.farm.update.mockResolvedValue(updatedFarm);

    await expect(
      service.update('farm-id', {
        name: ' Fazenda Atualizada ',
        city: ' Campinas ',
        state: ' sp ',
        totalArea: 1200,
        agriculturalArea: 800,
        vegetationArea: 300,
      }),
    ).resolves.toEqual(updatedFarm);

    const anyDecimalMatcher = expect.any(
      Prisma.Decimal,
    ) as unknown as Prisma.Decimal;

    expect(prismaMock.farm.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'farm-id',
        status: RecordStatus.ACTIVE,
      },
    });

    expect(prismaMock.farm.update).toHaveBeenCalledWith({
      where: {
        id: 'farm-id',
      },
      data: {
        name: 'Fazenda Atualizada',
        city: 'Campinas',
        state: 'SP',
        totalArea: anyDecimalMatcher,
        agriculturalArea: anyDecimalMatcher,
        vegetationArea: anyDecimalMatcher,
      },
      include: {
        producer: true,
      },
    });
  });

  it('should throw BadRequestException when updating farm with invalid area rule', async () => {
    prismaMock.farm.findFirst.mockResolvedValue({
      id: 'farm-id',
      totalArea: new Prisma.Decimal(1000),
      agriculturalArea: new Prisma.Decimal(700),
      vegetationArea: new Prisma.Decimal(250),
      status: RecordStatus.ACTIVE,
    });

    await expect(
      service.update('farm-id', {
        agriculturalArea: 800,
        vegetationArea: 300,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.farm.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when updating missing or inactive farm', async () => {
    prismaMock.farm.findFirst.mockResolvedValue(null);

    await expect(
      service.update('missing-farm-id', {
        name: 'Fazenda Atualizada',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.farm.update).not.toHaveBeenCalled();
  });

  it('should inactivate an active farm', async () => {
    prismaMock.farm.findUnique.mockResolvedValue({
      id: 'farm-id',
      status: RecordStatus.ACTIVE,
    });

    prismaMock.farm.update.mockResolvedValue({
      id: 'farm-id',
      status: RecordStatus.INACTIVE,
      inactiveAt: new Date(),
    });

    await expect(service.remove('farm-id')).resolves.toEqual({
      message: 'Fazenda inativada com sucesso.',
    });

    const anyDateMatcher = expect.any(Date) as unknown as Date;

    expect(prismaMock.farm.update).toHaveBeenCalledWith({
      where: {
        id: 'farm-id',
      },
      data: {
        status: RecordStatus.INACTIVE,
        inactiveAt: anyDateMatcher,
      },
    });
  });

  it('should return message when farm is already inactive', async () => {
    prismaMock.farm.findUnique.mockResolvedValue({
      id: 'farm-id',
      status: RecordStatus.INACTIVE,
    });

    await expect(service.remove('farm-id')).resolves.toEqual({
      message: 'Fazenda já estava inativa.',
    });

    expect(prismaMock.farm.update).not.toHaveBeenCalled();
  });

  it('should list active farms by producer without optional filters', async () => {
    const farms = [
      {
        id: 'farm-id',
        producerId: 'producer-id',
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        status: RecordStatus.ACTIVE,
        plantedCrops: [],
      },
    ];

    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    prismaMock.farm.findMany.mockResolvedValue(farms);
    prismaMock.farm.count.mockResolvedValue(1);

    await expect(
      service.findAllByProducer('producer-id', {
        page: 1,
        limit: 10,
      }),
    ).resolves.toEqual({
      data: farms,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(prismaMock.farm.findMany).toHaveBeenCalledWith({
      where: {
        producerId: 'producer-id',
        status: RecordStatus.ACTIVE,
      },
      skip: 0,
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        plantedCrops: {
          where: {
            status: RecordStatus.ACTIVE,
          },
          include: {
            crop: true,
            harvest: true,
          },
        },
      },
    });

    expect(prismaMock.farm.count).toHaveBeenCalledWith({
      where: {
        producerId: 'producer-id',
        status: RecordStatus.ACTIVE,
      },
    });
  });

  it('should update only farm name using current area values', async () => {
    const currentFarm = {
      id: 'farm-id',
      totalArea: new Prisma.Decimal(1000),
      agriculturalArea: new Prisma.Decimal(700),
      vegetationArea: new Prisma.Decimal(250),
      status: RecordStatus.ACTIVE,
    };

    const updatedFarm = {
      id: 'farm-id',
      name: 'Fazenda Renomeada',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: new Prisma.Decimal(1000),
      agriculturalArea: new Prisma.Decimal(700),
      vegetationArea: new Prisma.Decimal(250),
      status: RecordStatus.ACTIVE,
      producer: {
        id: 'producer-id',
      },
    };

    prismaMock.farm.findFirst.mockResolvedValue(currentFarm);
    prismaMock.farm.update.mockResolvedValue(updatedFarm);

    await expect(
      service.update('farm-id', {
        name: ' Fazenda Renomeada ',
      }),
    ).resolves.toEqual(updatedFarm);

    expect(prismaMock.farm.update).toHaveBeenCalledWith({
      where: {
        id: 'farm-id',
      },
      data: {
        name: 'Fazenda Renomeada',
      },
      include: {
        producer: true,
      },
    });
  });

  it('should throw NotFoundException when removing missing farm', async () => {
    prismaMock.farm.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing-farm-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prismaMock.farm.update).not.toHaveBeenCalled();
  });
});
