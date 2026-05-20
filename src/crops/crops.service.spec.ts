import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CropsService } from './crops.service';
import { RecordStatus } from '@prisma/client';

describe('CropsService', () => {
  let service: CropsService;

  const prismaMock = {
    crop: {
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

    service = new CropsService(prismaMock as unknown as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create a crop when name is unique', async () => {
    const dto = {
      name: 'Soja',
    };

    const crop = {
      id: 'crop-id',
      name: 'Soja',
      status: 'ACTIVE',
      inactiveAt: null,
    };

    prismaMock.crop.findUnique.mockResolvedValue(null);
    prismaMock.crop.create.mockResolvedValue(crop);

    await expect(service.create(dto)).resolves.toEqual(crop);

    expect(prismaMock.crop.findUnique).toHaveBeenCalledWith({
      where: {
        name: 'Soja',
      },
    });

    expect(prismaMock.crop.create).toHaveBeenCalledWith({
      data: {
        name: 'Soja',
        status: 'ACTIVE',
      },
    });
  });

  it('should throw ConflictException when active crop name already exists', async () => {
    prismaMock.crop.findUnique.mockResolvedValue({
      id: 'existing-crop-id',
      name: 'Soja',
      status: 'ACTIVE',
    });

    await expect(
      service.create({
        name: 'Soja',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.crop.create).not.toHaveBeenCalled();
  });

  it('should list active crops with pagination', async () => {
    const query = {
      page: 1,
      limit: 10,
      search: 'soja',
    };

    const crops = [
      {
        id: 'crop-id',
        name: 'Soja',
        status: 'ACTIVE',
      },
    ];

    prismaMock.crop.findMany.mockResolvedValue(crops);
    prismaMock.crop.count.mockResolvedValue(1);

    const result = await service.findAll(query);

    expect(result).toEqual({
      data: crops,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(prismaMock.crop.findMany).toHaveBeenCalled();
    expect(prismaMock.crop.count).toHaveBeenCalled();
  });

  it('should find one active crop by id', async () => {
    const crop = {
      id: 'crop-id',
      name: 'Soja',
      status: 'ACTIVE',
    };

    prismaMock.crop.findFirst.mockResolvedValue(crop);

    await expect(service.findOne('crop-id')).resolves.toEqual(crop);

    expect(prismaMock.crop.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'crop-id',
        status: 'ACTIVE',
      },
    });
  });

  it('should throw NotFoundException when crop does not exist', async () => {
    prismaMock.crop.findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-crop-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should update a crop when name is unique', async () => {
    const existingCrop = {
      id: 'crop-id',
      name: 'Soja',
      status: 'ACTIVE',
    };

    const updatedCrop = {
      id: 'crop-id',
      name: 'Milho',
      status: 'ACTIVE',
    };

    prismaMock.crop.findUnique.mockResolvedValue(null);
    prismaMock.crop.findFirst.mockResolvedValue(existingCrop);
    prismaMock.crop.update.mockResolvedValue(updatedCrop);

    await expect(
      service.update('crop-id', {
        name: 'Milho',
      }),
    ).resolves.toEqual(updatedCrop);

    expect(prismaMock.crop.update).toHaveBeenCalledWith({
      where: {
        id: 'crop-id',
      },
      data: {
        name: 'Milho',
      },
    });
  });

  it('should throw ConflictException when updating to duplicated active name', async () => {
    prismaMock.crop.findFirst.mockResolvedValue({
      id: 'crop-id',
      name: 'Soja',
      status: 'ACTIVE',
    });

    prismaMock.crop.findUnique.mockResolvedValue({
      id: 'another-crop-id',
      name: 'Milho',
      status: 'ACTIVE',
    });

    await expect(
      service.update('crop-id', {
        name: 'Milho',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.crop.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when updating missing crop', async () => {
    prismaMock.crop.findUnique.mockResolvedValue(null);
    prismaMock.crop.findFirst.mockResolvedValue(null);

    await expect(
      service.update('missing-crop-id', {
        name: 'Milho',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should inactivate a crop', async () => {
    const crop = {
      id: 'crop-id',
      name: 'Soja',
      status: 'ACTIVE',
    };

    prismaMock.crop.findUnique.mockResolvedValue(crop);
    prismaMock.crop.findFirst.mockResolvedValue(crop);

    prismaMock.crop.update.mockResolvedValue({
      id: 'crop-id',
      name: 'Soja',
      status: 'INACTIVE',
      inactiveAt: new Date(),
    });

    await expect(service.remove('crop-id')).resolves.toEqual({
      message: 'Cultura inativada com sucesso.',
    });

    const anyDateMatcher = expect.any(Date) as unknown as Date;

    expect(prismaMock.crop.update).toHaveBeenCalledWith({
      where: {
        id: 'crop-id',
      },
      data: {
        status: 'INACTIVE',
        inactiveAt: anyDateMatcher,
      },
    });
  });

  it('should update crop when duplicated name belongs to the same crop', async () => {
    const existingCrop = {
      id: 'crop-id',
      name: 'Soja',
      status: RecordStatus.ACTIVE,
    };

    const updatedCrop = {
      id: 'crop-id',
      name: 'Soja',
      status: RecordStatus.ACTIVE,
    };

    prismaMock.crop.findFirst.mockResolvedValue(existingCrop);

    prismaMock.crop.findUnique.mockResolvedValue({
      id: 'crop-id',
      name: 'Soja',
      status: RecordStatus.ACTIVE,
    });

    prismaMock.crop.update.mockResolvedValue(updatedCrop);

    await expect(
      service.update('crop-id', {
        name: 'Soja',
      }),
    ).resolves.toEqual(updatedCrop);

    expect(prismaMock.crop.update).toHaveBeenCalledWith({
      where: {
        id: 'crop-id',
      },
      data: {
        name: 'Soja',
      },
    });
  });

  it('should update crop when found crop with same name belongs to the same crop', async () => {
    const existingCrop = {
      id: 'crop-id',
      name: 'Soja',
      status: RecordStatus.ACTIVE,
    };

    const updatedCrop = {
      id: 'crop-id',
      name: 'Soja',
      status: RecordStatus.ACTIVE,
    };

    prismaMock.crop.findFirst.mockResolvedValue(existingCrop);

    prismaMock.crop.findUnique.mockResolvedValue({
      id: 'crop-id',
      name: 'Soja',
      status: RecordStatus.ACTIVE,
    });

    prismaMock.crop.update.mockResolvedValue(updatedCrop);

    await expect(
      service.update('crop-id', {
        name: 'Soja',
      }),
    ).resolves.toEqual(updatedCrop);

    expect(prismaMock.crop.update).toHaveBeenCalledWith({
      where: {
        id: 'crop-id',
      },
      data: {
        name: 'Soja',
      },
    });
  });

  it('should return message when crop is already inactive', async () => {
    prismaMock.crop.findUnique.mockResolvedValue({
      id: 'crop-id',
      status: RecordStatus.INACTIVE,
    });

    await expect(service.remove('crop-id')).resolves.toEqual({
      message: 'Cultura já estava inativa.',
    });

    expect(prismaMock.crop.update).not.toHaveBeenCalled();
  });

  it('should list active crops without search filter', async () => {
    const crops = [
      {
        id: 'crop-id',
        name: 'Soja',
        status: RecordStatus.ACTIVE,
      },
    ];

    prismaMock.crop.findMany.mockResolvedValue(crops);
    prismaMock.crop.count.mockResolvedValue(1);

    await expect(
      service.findAll({
        page: 1,
        limit: 10,
      }),
    ).resolves.toEqual({
      data: crops,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(prismaMock.crop.findMany).toHaveBeenCalledWith({
      where: {
        status: RecordStatus.ACTIVE,
      },
      skip: 0,
      take: 10,
      orderBy: {
        name: 'asc',
      },
    });

    expect(prismaMock.crop.count).toHaveBeenCalledWith({
      where: {
        status: RecordStatus.ACTIVE,
      },
    });
  });

  it('should update crop with empty dto', async () => {
    const existingCrop = {
      id: 'crop-id',
      name: 'Soja',
      status: RecordStatus.ACTIVE,
    };

    const updatedCrop = {
      id: 'crop-id',
      name: 'Soja',
      status: RecordStatus.ACTIVE,
    };

    prismaMock.crop.findFirst.mockResolvedValue(existingCrop);
    prismaMock.crop.update.mockResolvedValue(updatedCrop);

    await expect(service.update('crop-id', {})).resolves.toEqual(updatedCrop);

    expect(prismaMock.crop.findUnique).not.toHaveBeenCalled();

    expect(prismaMock.crop.update).toHaveBeenCalledWith({
      where: {
        id: 'crop-id',
      },
      data: {},
    });
  });

  it('should throw NotFoundException when removing missing crop', async () => {
    prismaMock.crop.findFirst.mockResolvedValue(null);

    await expect(service.remove('missing-crop-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
