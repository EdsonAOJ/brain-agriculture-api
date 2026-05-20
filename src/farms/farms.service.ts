import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { ListFarmsQueryDto } from './dto/list-farms-query.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/utils/pagination';
import { validateFarmAreas } from './domain/farm-area.validator';

@Injectable()
export class FarmsService {
  private readonly logger = new Logger(FarmsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(producerId: string, dto: CreateFarmDto) {
    await this.ensureActiveProducerExists(producerId);

    this.validateFarmAreasOrThrow({
      totalArea: dto.totalArea,
      agriculturalArea: dto.agriculturalArea,
      vegetationArea: dto.vegetationArea,
    });

    const farm = await this.prisma.farm.create({
      data: {
        producerId,
        name: dto.name.trim(),
        city: dto.city.trim(),
        state: dto.state.trim().toUpperCase(),
        totalArea: new Prisma.Decimal(dto.totalArea),
        agriculturalArea: new Prisma.Decimal(dto.agriculturalArea),
        vegetationArea: new Prisma.Decimal(dto.vegetationArea),
        status: RecordStatus.ACTIVE,
      },
      include: {
        producer: true,
      },
    });

    this.logger.log(`Farm created. farmId=${farm.id} producerId=${producerId}`);

    return farm;
  }

  async findAllByProducer(producerId: string, query: ListFarmsQueryDto) {
    await this.ensureActiveProducerExists(producerId);

    const { page, limit, skip, take } = getPaginationParams(query);

    const where: Prisma.FarmWhereInput = {
      producerId,
      status: RecordStatus.ACTIVE,
    };

    const search = query.search?.trim();

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          city: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.state) {
      where.state = query.state.trim().toUpperCase();
    }

    const [farms, total] = await Promise.all([
      this.prisma.farm.findMany({
        where,
        skip,
        take,
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
      }),
      this.prisma.farm.count({
        where,
      }),
    ]);

    return buildPaginatedResponse({
      data: farms,
      total,
      page,
      limit,
    });
  }

  async findOne(id: string) {
    const farm = await this.prisma.farm.findFirst({
      where: {
        id,
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

    if (!farm) {
      throw new NotFoundException('Fazenda não encontrada.');
    }

    return farm;
  }

  async update(id: string, dto: UpdateFarmDto) {
    const currentFarm = await this.ensureActiveFarmExists(id);

    const totalArea = dto.totalArea ?? Number(currentFarm.totalArea);
    const agriculturalArea =
      dto.agriculturalArea ?? Number(currentFarm.agriculturalArea);
    const vegetationArea =
      dto.vegetationArea ?? Number(currentFarm.vegetationArea);

    this.validateFarmAreasOrThrow({
      totalArea,
      agriculturalArea,
      vegetationArea,
    });

    const farm = await this.prisma.farm.update({
      where: {
        id,
      },
      data: {
        ...(dto.name && {
          name: dto.name.trim(),
        }),
        ...(dto.city && {
          city: dto.city.trim(),
        }),
        ...(dto.state && {
          state: dto.state.trim().toUpperCase(),
        }),
        ...(dto.totalArea !== undefined && {
          totalArea: new Prisma.Decimal(dto.totalArea),
        }),
        ...(dto.agriculturalArea !== undefined && {
          agriculturalArea: new Prisma.Decimal(dto.agriculturalArea),
        }),
        ...(dto.vegetationArea !== undefined && {
          vegetationArea: new Prisma.Decimal(dto.vegetationArea),
        }),
      },
      include: {
        producer: true,
      },
    });

    this.logger.log(`Farm updated. farmId=${farm.id}`);

    return farm;
  }

  async remove(id: string) {
    const farm = await this.prisma.farm.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!farm) {
      throw new NotFoundException('Fazenda não encontrada.');
    }

    if (farm.status === RecordStatus.INACTIVE) {
      return {
        message: 'Fazenda já estava inativa.',
      };
    }

    await this.prisma.farm.update({
      where: {
        id,
      },
      data: {
        status: RecordStatus.INACTIVE,
        inactiveAt: new Date(),
      },
    });

    this.logger.log(`Farm inactivated. farmId=${id}`);

    return {
      message: 'Fazenda inativada com sucesso.',
    };
  }

  private async ensureActiveProducerExists(producerId: string) {
    const producer = await this.prisma.producer.findFirst({
      where: {
        id: producerId,
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

  private async ensureActiveFarmExists(id: string) {
    const farm = await this.prisma.farm.findFirst({
      where: {
        id,
        status: RecordStatus.ACTIVE,
      },
    });

    if (!farm) {
      throw new NotFoundException('Fazenda não encontrada ou inativa.');
    }

    return farm;
  }

  private validateFarmAreasOrThrow(params: {
    totalArea: number;
    agriculturalArea: number;
    vegetationArea: number;
  }) {
    const result = validateFarmAreas(params);

    if (!result.isValid) {
      throw new BadRequestException(
        'A soma da área agricultável e da área de vegetação não pode ultrapassar a área total da fazenda.',
      );
    }
  }
}
