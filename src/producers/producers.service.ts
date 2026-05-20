import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DocumentType, Prisma, RecordStatus } from '@prisma/client';
import {
  getDocumentType,
  isValidCpfOrCnpj,
  normalizeDocument,
} from '../common/validators/document.validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { ListProducersQueryDto } from './dto/list-producers-query.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/utils/pagination';

@Injectable()
export class ProducersService {
  private readonly logger = new Logger(ProducersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProducerDto) {
    const document = normalizeDocument(dto.document);

    if (!isValidCpfOrCnpj(document)) {
      throw new BadRequestException('CPF ou CNPJ inválido.');
    }

    const documentType = getDocumentType(document);

    if (!documentType) {
      throw new BadRequestException('Documento deve ser CPF ou CNPJ.');
    }

    const existingProducer = await this.prisma.producer.findUnique({
      where: {
        document,
      },
    });

    if (existingProducer) {
      throw new ConflictException(
        'Já existe um produtor cadastrado com este CPF/CNPJ.',
      );
    }

    const producer = await this.prisma.producer.create({
      data: {
        document,
        documentType: documentType,
        name: dto.name.trim(),
        status: RecordStatus.ACTIVE,
      },
      include: {
        farms: true,
      },
    });

    this.logger.log(`Producer created. producerId=${producer.id}`);

    return producer;
  }
  async findAll(query: ListProducersQueryDto) {
    const { page, limit, skip, take } = getPaginationParams(query);

    const where: Prisma.ProducerWhereInput = {
      status: RecordStatus.ACTIVE,
    };

    const search = query.search?.trim();

    if (search) {
      const normalizedSearch = normalizeDocument(search);

      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          document: {
            contains: normalizedSearch || search,
          },
        },
      ];
    }

    const [producers, total] = await Promise.all([
      this.prisma.producer.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          farms: {
            where: {
              status: RecordStatus.ACTIVE,
            },
          },
        },
      }),
      this.prisma.producer.count({
        where,
      }),
    ]);

    return buildPaginatedResponse({
      data: producers,
      total,
      page,
      limit,
    });
  }

  async findOne(id: string) {
    const producer = await this.prisma.producer.findFirst({
      where: {
        id,
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

    if (!producer) {
      throw new NotFoundException('Produtor não encontrado.');
    }

    return producer;
  }

  async update(id: string, dto: UpdateProducerDto) {
    await this.ensureActiveProducerExists(id);

    let normalizedDocument: string | undefined;
    let documentType: DocumentType | undefined;

    if (dto.document) {
      normalizedDocument = normalizeDocument(dto.document);

      if (!isValidCpfOrCnpj(normalizedDocument)) {
        throw new BadRequestException('CPF ou CNPJ inválido.');
      }

      const detectedDocumentType = getDocumentType(normalizedDocument);

      if (!detectedDocumentType) {
        throw new BadRequestException('Documento deve ser CPF ou CNPJ.');
      }

      documentType = detectedDocumentType;

      const producerWithSameDocument = await this.prisma.producer.findUnique({
        where: {
          document: normalizedDocument,
        },
      });

      if (producerWithSameDocument && producerWithSameDocument.id !== id) {
        throw new ConflictException(
          'Já existe outro produtor cadastrado com este CPF/CNPJ.',
        );
      }
    }

    const producer = await this.prisma.producer.update({
      where: {
        id,
      },
      data: {
        ...(dto.name && {
          name: dto.name.trim(),
        }),
        ...(normalizedDocument && {
          document: normalizedDocument,
          documentType,
        }),
      },
      include: {
        farms: {
          where: {
            status: RecordStatus.ACTIVE,
          },
        },
      },
    });

    this.logger.log(`Producer updated. producerId=${producer.id}`);

    return producer;
  }

  async remove(id: string) {
    const producer = await this.prisma.producer.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!producer) {
      throw new NotFoundException('Produtor não encontrado.');
    }

    if (producer.status === RecordStatus.INACTIVE) {
      return {
        message: 'Produtor já estava inativo.',
      };
    }

    await this.prisma.producer.update({
      where: {
        id,
      },
      data: {
        status: RecordStatus.INACTIVE,
        inactiveAt: new Date(),
      },
    });

    this.logger.log(`Producer inactivated. producerId=${id}`);

    return {
      message: 'Produtor inativado com sucesso.',
    };
  }

  private async ensureActiveProducerExists(id: string) {
    const producer = await this.prisma.producer.findFirst({
      where: {
        id,
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (!producer) {
      throw new NotFoundException('Produtor não encontrado ou inativo.');
    }

    return producer;
  }
}
