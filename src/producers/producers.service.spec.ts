import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DocumentType, RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProducersService } from './producers.service';

describe('ProducersService', () => {
  let service: ProducersService;

  const prismaMock = {
    producer: {
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

    service = new ProducersService(prismaMock as unknown as PrismaService);
  });

  it('should create a producer with valid CPF', async () => {
    const dto = {
      document: '529.982.247-25',
      name: ' João da Silva ',
    };

    const producer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: DocumentType.CPF,
      name: 'João da Silva',
      status: RecordStatus.ACTIVE,
      farms: [],
    };

    prismaMock.producer.findUnique.mockResolvedValue(null);
    prismaMock.producer.create.mockResolvedValue(producer);

    await expect(service.create(dto)).resolves.toEqual(producer);

    expect(prismaMock.producer.findUnique).toHaveBeenCalledWith({
      where: {
        document: '52998224725',
      },
    });

    expect(prismaMock.producer.create).toHaveBeenCalledWith({
      data: {
        document: '52998224725',
        documentType: DocumentType.CPF,
        name: 'João da Silva',
        status: RecordStatus.ACTIVE,
      },
      include: {
        farms: true,
      },
    });
  });

  it('should throw BadRequestException when CPF/CNPJ is invalid', async () => {
    await expect(
      service.create({
        document: '11111111111',
        name: 'Produtor Inválido',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.producer.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.producer.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when CPF/CNPJ already exists', async () => {
    prismaMock.producer.findUnique.mockResolvedValue({
      id: 'existing-producer-id',
      document: '52998224725',
      status: RecordStatus.ACTIVE,
    });

    await expect(
      service.create({
        document: '529.982.247-25',
        name: 'João da Silva',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.producer.create).not.toHaveBeenCalled();
  });

  it('should list active producers with pagination and search', async () => {
    const producers = [
      {
        id: 'producer-id',
        document: '52998224725',
        documentType: DocumentType.CPF,
        name: 'João da Silva',
        status: RecordStatus.ACTIVE,
        farms: [],
      },
    ];

    prismaMock.producer.findMany.mockResolvedValue(producers);
    prismaMock.producer.count.mockResolvedValue(1);

    await expect(
      service.findAll({
        page: 1,
        limit: 10,
        search: 'João',
      }),
    ).resolves.toEqual({
      data: producers,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    expect(prismaMock.producer.findMany).toHaveBeenCalled();
    expect(prismaMock.producer.count).toHaveBeenCalled();
  });

  it('should find one active producer by id', async () => {
    const producer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: DocumentType.CPF,
      name: 'João da Silva',
      status: RecordStatus.ACTIVE,
      farms: [],
    };

    prismaMock.producer.findFirst.mockResolvedValue(producer);

    await expect(service.findOne('producer-id')).resolves.toEqual(producer);

    expect(prismaMock.producer.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'producer-id',
        status: RecordStatus.ACTIVE,
      },
      include: {
        farms: {
          where: {
            status: RecordStatus.ACTIVE,
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
        },
      },
    });
  });

  it('should throw NotFoundException when producer is not found', async () => {
    prismaMock.producer.findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-producer-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should update producer name', async () => {
    const updatedProducer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: DocumentType.CPF,
      name: 'João Atualizado',
      status: RecordStatus.ACTIVE,
      farms: [],
    };

    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    prismaMock.producer.update.mockResolvedValue(updatedProducer);

    await expect(
      service.update('producer-id', {
        name: ' João Atualizado ',
      }),
    ).resolves.toEqual(updatedProducer);

    expect(prismaMock.producer.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'producer-id',
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    expect(prismaMock.producer.update).toHaveBeenCalledWith({
      where: {
        id: 'producer-id',
      },
      data: {
        name: 'João Atualizado',
      },
      include: {
        farms: {
          where: {
            status: RecordStatus.ACTIVE,
          },
        },
      },
    });
  });

  it('should update producer document when CPF/CNPJ is valid and unique', async () => {
    const updatedProducer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: DocumentType.CPF,
      name: 'João da Silva',
      status: RecordStatus.ACTIVE,
      farms: [],
    };

    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    prismaMock.producer.findUnique.mockResolvedValue(null);
    prismaMock.producer.update.mockResolvedValue(updatedProducer);

    await expect(
      service.update('producer-id', {
        document: '529.982.247-25',
      }),
    ).resolves.toEqual(updatedProducer);

    expect(prismaMock.producer.findUnique).toHaveBeenCalledWith({
      where: {
        document: '52998224725',
      },
    });

    expect(prismaMock.producer.update).toHaveBeenCalledWith({
      where: {
        id: 'producer-id',
      },
      data: {
        document: '52998224725',
        documentType: DocumentType.CPF,
      },
      include: {
        farms: {
          where: {
            status: RecordStatus.ACTIVE,
          },
        },
      },
    });
  });

  it('should throw BadRequestException when updating with invalid CPF/CNPJ', async () => {
    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    await expect(
      service.update('producer-id', {
        document: '11111111111',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.producer.update).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when updating with duplicated CPF/CNPJ from another producer', async () => {
    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    prismaMock.producer.findUnique.mockResolvedValue({
      id: 'another-producer-id',
      document: '52998224725',
    });

    await expect(
      service.update('producer-id', {
        document: '529.982.247-25',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.producer.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when updating inactive or missing producer', async () => {
    prismaMock.producer.findFirst.mockResolvedValue(null);

    await expect(
      service.update('missing-producer-id', {
        name: 'João Atualizado',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.producer.update).not.toHaveBeenCalled();
  });

  it('should inactivate an active producer', async () => {
    prismaMock.producer.findUnique.mockResolvedValue({
      id: 'producer-id',
      status: RecordStatus.ACTIVE,
    });

    prismaMock.producer.update.mockResolvedValue({
      id: 'producer-id',
      status: RecordStatus.INACTIVE,
      inactiveAt: new Date(),
    });

    await expect(service.remove('producer-id')).resolves.toEqual({
      message: 'Produtor inativado com sucesso.',
    });

    const anyDateMatcher = expect.any(Date) as unknown as Date;

    expect(prismaMock.producer.update).toHaveBeenCalledWith({
      where: {
        id: 'producer-id',
      },
      data: {
        status: RecordStatus.INACTIVE,
        inactiveAt: anyDateMatcher,
      },
    });
  });

  it('should return message when producer is already inactive', async () => {
    prismaMock.producer.findUnique.mockResolvedValue({
      id: 'producer-id',
      status: RecordStatus.INACTIVE,
    });

    await expect(service.remove('producer-id')).resolves.toEqual({
      message: 'Produtor já estava inativo.',
    });

    expect(prismaMock.producer.update).not.toHaveBeenCalled();
  });

  it('should update producer document when same document belongs to the same producer', async () => {
    const updatedProducer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: DocumentType.CPF,
      name: 'João da Silva',
      status: RecordStatus.ACTIVE,
      farms: [],
    };

    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    prismaMock.producer.findUnique.mockResolvedValue({
      id: 'producer-id',
      document: '52998224725',
    });

    prismaMock.producer.update.mockResolvedValue(updatedProducer);

    await expect(
      service.update('producer-id', {
        document: '529.982.247-25',
      }),
    ).resolves.toEqual(updatedProducer);

    expect(prismaMock.producer.update).toHaveBeenCalledWith({
      where: {
        id: 'producer-id',
      },
      data: {
        document: '52998224725',
        documentType: DocumentType.CPF,
      },
      include: {
        farms: {
          where: {
            status: RecordStatus.ACTIVE,
          },
        },
      },
    });
  });

  it('should update producer name and document together', async () => {
    const updatedProducer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: DocumentType.CPF,
      name: 'João Atualizado',
      status: RecordStatus.ACTIVE,
      farms: [],
    };

    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    prismaMock.producer.findUnique.mockResolvedValue({
      id: 'producer-id',
      document: '52998224725',
    });

    prismaMock.producer.update.mockResolvedValue(updatedProducer);

    await expect(
      service.update('producer-id', {
        name: ' João Atualizado ',
        document: '529.982.247-25',
      }),
    ).resolves.toEqual(updatedProducer);

    expect(prismaMock.producer.update).toHaveBeenCalledWith({
      where: {
        id: 'producer-id',
      },
      data: {
        name: 'João Atualizado',
        document: '52998224725',
        documentType: DocumentType.CPF,
      },
      include: {
        farms: {
          where: {
            status: RecordStatus.ACTIVE,
          },
        },
      },
    });
  });

  it('should update producer name and document together', async () => {
    const updatedProducer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: DocumentType.CPF,
      name: 'João Atualizado',
      status: RecordStatus.ACTIVE,
      farms: [],
    };

    prismaMock.producer.findFirst.mockResolvedValue({
      id: 'producer-id',
    });

    prismaMock.producer.findUnique.mockResolvedValue({
      id: 'producer-id',
      document: '52998224725',
    });

    prismaMock.producer.update.mockResolvedValue(updatedProducer);

    await expect(
      service.update('producer-id', {
        name: ' João Atualizado ',
        document: '529.982.247-25',
      }),
    ).resolves.toEqual(updatedProducer);

    expect(prismaMock.producer.update).toHaveBeenCalledWith({
      where: {
        id: 'producer-id',
      },
      data: {
        name: 'João Atualizado',
        document: '52998224725',
        documentType: DocumentType.CPF,
      },
      include: {
        farms: {
          where: {
            status: RecordStatus.ACTIVE,
          },
        },
      },
    });
  });

  it('should throw NotFoundException when removing missing producer', async () => {
    prismaMock.producer.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing-producer-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prismaMock.producer.update).not.toHaveBeenCalled();
  });
});
