import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HarvestsService } from './harvests.service';
import { RecordStatus } from '@prisma/client';

describe('HarvestsService', () => {
  let service: HarvestsService;

  const prismaMock = {
    harvest: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();

    service = new HarvestsService(prismaMock as unknown as PrismaService);
  });
  it('should create a harvest when name is unique', async () => {
    const dto = {
      name: 'Safra 2021',
    };

    const harvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: 'ACTIVE',
      inactiveAt: null,
    };

    prismaMock.harvest.findUnique.mockResolvedValue(null);
    prismaMock.harvest.create.mockResolvedValue(harvest);

    await expect(service.create(dto)).resolves.toEqual(harvest);

    expect(prismaMock.harvest.findUnique).toHaveBeenCalledWith({
      where: {
        name: 'Safra 2021',
      },
    });

    expect(prismaMock.harvest.create).toHaveBeenCalledWith({
      data: {
        name: 'Safra 2021',
        status: 'ACTIVE',
      },
    });
  });

  it('should throw ConflictException when active harvest name already exists', async () => {
    prismaMock.harvest.findUnique.mockResolvedValue({
      id: 'existing-harvest-id',
      name: 'Safra 2021',
      status: 'ACTIVE',
    });

    await expect(
      service.create({
        name: 'Safra 2021',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.harvest.create).not.toHaveBeenCalled();
  });

  it('should list active harvests with pagination', async () => {
    const query = {
      page: 1,
      limit: 10,
      search: '2021',
    };

    const harvests = [
      {
        id: 'harvest-id',
        name: 'Safra 2021',
        status: 'ACTIVE',
      },
    ];

    prismaMock.harvest.findMany.mockResolvedValue(harvests);
    prismaMock.harvest.count.mockResolvedValue(1);

    const result = await service.findAll(query);

    expect(result).toEqual({
      data: harvests,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(prismaMock.harvest.findMany).toHaveBeenCalled();
    expect(prismaMock.harvest.count).toHaveBeenCalled();
  });

  it('should find one active harvest by id', async () => {
    const harvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: 'ACTIVE',
    };

    prismaMock.harvest.findFirst.mockResolvedValue(harvest);

    await expect(service.findOne('harvest-id')).resolves.toEqual(harvest);

    expect(prismaMock.harvest.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'harvest-id',
        status: 'ACTIVE',
      },
    });
  });

  it('should throw NotFoundException when harvest does not exist', async () => {
    prismaMock.harvest.findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-harvest-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should update a harvest when name is unique', async () => {
    const existingHarvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: 'ACTIVE',
    };

    const updatedHarvest = {
      id: 'harvest-id',
      name: 'Safra 2022',
      status: 'ACTIVE',
    };

    prismaMock.harvest.findFirst.mockResolvedValue(existingHarvest);
    prismaMock.harvest.findUnique.mockResolvedValue(null);
    prismaMock.harvest.update.mockResolvedValue(updatedHarvest);

    await expect(
      service.update('harvest-id', {
        name: 'Safra 2022',
      }),
    ).resolves.toEqual(updatedHarvest);

    expect(prismaMock.harvest.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'harvest-id',
        status: 'ACTIVE',
      },
      select: {
        id: true,
      },
    });

    expect(prismaMock.harvest.findUnique).toHaveBeenCalledWith({
      where: {
        name: 'Safra 2022',
      },
    });

    expect(prismaMock.harvest.update).toHaveBeenCalledWith({
      where: {
        id: 'harvest-id',
      },
      data: {
        name: 'Safra 2022',
      },
    });
  });

  it('should throw ConflictException when updating to duplicated active name', async () => {
    prismaMock.harvest.findFirst.mockResolvedValue({
      id: 'harvest-id',
      name: 'Safra 2021',
      status: 'ACTIVE',
    });

    prismaMock.harvest.findUnique.mockResolvedValue({
      id: 'another-harvest-id',
      name: 'Safra 2022',
      status: 'ACTIVE',
    });

    await expect(
      service.update('harvest-id', {
        name: 'Safra 2022',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.harvest.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when updating missing harvest', async () => {
    prismaMock.harvest.findFirst.mockResolvedValue(null);

    await expect(
      service.update('missing-harvest-id', {
        name: 'Safra 2022',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should inactivate a harvest', async () => {
    const harvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: 'ACTIVE',
    };

    prismaMock.harvest.findUnique.mockResolvedValue(harvest);
    prismaMock.harvest.findFirst.mockResolvedValue(harvest);

    prismaMock.harvest.update.mockResolvedValue({
      id: 'harvest-id',
      name: 'Safra 2021',
      status: 'INACTIVE',
      inactiveAt: new Date(),
    });

    await expect(service.remove('harvest-id')).resolves.toEqual({
      message: 'Safra inativada com sucesso.',
    });
    const anyDateMatcher = expect.any(Date) as unknown as Date;

    expect(prismaMock.harvest.update).toHaveBeenCalledWith({
      where: {
        id: 'harvest-id',
      },
      data: {
        status: 'INACTIVE',
        inactiveAt: anyDateMatcher,
      },
    });
  });

  it('should update harvest when duplicated name belongs to the same harvest', async () => {
    const existingHarvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: RecordStatus.ACTIVE,
    };

    const updatedHarvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: RecordStatus.ACTIVE,
    };

    prismaMock.harvest.findFirst.mockResolvedValue(existingHarvest);

    prismaMock.harvest.findUnique.mockResolvedValue({
      id: 'harvest-id',
      name: 'Safra 2021',
      status: RecordStatus.ACTIVE,
    });

    prismaMock.harvest.update.mockResolvedValue(updatedHarvest);

    await expect(
      service.update('harvest-id', {
        name: 'Safra 2021',
      }),
    ).resolves.toEqual(updatedHarvest);

    expect(prismaMock.harvest.update).toHaveBeenCalledWith({
      where: {
        id: 'harvest-id',
      },
      data: {
        name: 'Safra 2021',
      },
    });
  });

  it('should update harvest when found harvest with same name belongs to the same harvest', async () => {
    const existingHarvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: RecordStatus.ACTIVE,
    };

    const updatedHarvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: RecordStatus.ACTIVE,
    };

    prismaMock.harvest.findFirst.mockResolvedValue(existingHarvest);

    prismaMock.harvest.findUnique.mockResolvedValue({
      id: 'harvest-id',
      name: 'Safra 2021',
      status: RecordStatus.ACTIVE,
    });

    prismaMock.harvest.update.mockResolvedValue(updatedHarvest);

    await expect(
      service.update('harvest-id', {
        name: 'Safra 2021',
      }),
    ).resolves.toEqual(updatedHarvest);

    expect(prismaMock.harvest.update).toHaveBeenCalledWith({
      where: {
        id: 'harvest-id',
      },
      data: {
        name: 'Safra 2021',
      },
    });
  });

  it('should throw NotFoundException when removing missing harvest', async () => {
    prismaMock.harvest.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing-harvest-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prismaMock.harvest.update).not.toHaveBeenCalled();
  });

  it('should return message when harvest is already inactive', async () => {
    prismaMock.harvest.findUnique.mockResolvedValue({
      id: 'harvest-id',
      status: RecordStatus.INACTIVE,
    });

    await expect(service.remove('harvest-id')).resolves.toEqual({
      message: 'Safra já estava inativa.',
    });

    expect(prismaMock.harvest.update).not.toHaveBeenCalled();
  });

  it('should list active harvests without search filter', async () => {
    const harvests = [
      {
        id: 'harvest-id',
        name: 'Safra 2021',
        status: RecordStatus.ACTIVE,
      },
    ];

    prismaMock.harvest.findMany.mockResolvedValue(harvests);
    prismaMock.harvest.count.mockResolvedValue(1);

    await expect(
      service.findAll({
        page: 1,
        limit: 10,
      }),
    ).resolves.toEqual({
      data: harvests,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(prismaMock.harvest.findMany).toHaveBeenCalledWith({
      where: {
        status: RecordStatus.ACTIVE,
      },
      skip: 0,
      take: 10,
      orderBy: {
        name: 'asc',
      },
    });

    expect(prismaMock.harvest.count).toHaveBeenCalledWith({
      where: {
        status: RecordStatus.ACTIVE,
      },
    });
  });

  it('should update harvest with empty dto', async () => {
    const existingHarvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: RecordStatus.ACTIVE,
    };

    const updatedHarvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: RecordStatus.ACTIVE,
    };

    prismaMock.harvest.findFirst.mockResolvedValue(existingHarvest);
    prismaMock.harvest.update.mockResolvedValue(updatedHarvest);

    await expect(service.update('harvest-id', {})).resolves.toEqual(
      updatedHarvest,
    );

    expect(prismaMock.harvest.findUnique).not.toHaveBeenCalled();

    expect(prismaMock.harvest.update).toHaveBeenCalledWith({
      where: {
        id: 'harvest-id',
      },
      data: {},
    });
  });
});
