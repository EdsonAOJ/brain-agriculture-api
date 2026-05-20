import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { ListHarvestsQueryDto } from './dto/list-harvests-query.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/utils/pagination';

@Injectable()
export class HarvestsService {
  private readonly logger = new Logger(HarvestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHarvestDto) {
    const name = this.normalizeName(dto.name);

    const existingHarvest = await this.prisma.harvest.findUnique({
      where: {
        name,
      },
    });

    if (existingHarvest) {
      throw new ConflictException(
        'Já existe uma safra cadastrada com este nome.',
      );
    }

    const harvest = await this.prisma.harvest.create({
      data: {
        name,
        status: RecordStatus.ACTIVE,
      },
    });

    this.logger.log(`Harvest created. harvestId=${harvest.id}`);

    return harvest;
  }

  async findAll(query: ListHarvestsQueryDto) {
    const { page, limit, skip, take } = getPaginationParams(query);

    const where: Prisma.HarvestWhereInput = {
      status: RecordStatus.ACTIVE,
    };

    const search = query.search?.trim();

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [harvests, total] = await Promise.all([
      this.prisma.harvest.findMany({
        where,
        skip,
        take,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.harvest.count({
        where,
      }),
    ]);

    return buildPaginatedResponse({
      data: harvests,
      total,
      page,
      limit,
    });
  }

  async findOne(id: string) {
    const harvest = await this.prisma.harvest.findFirst({
      where: {
        id,
        status: RecordStatus.ACTIVE,
      },
    });

    if (!harvest) {
      throw new NotFoundException('Safra não encontrada.');
    }

    return harvest;
  }

  async update(id: string, dto: UpdateHarvestDto) {
    await this.ensureActiveHarvestExists(id);

    let name: string | undefined;

    if (dto.name) {
      name = this.normalizeName(dto.name);

      const harvestWithSameName = await this.prisma.harvest.findUnique({
        where: {
          name,
        },
      });

      if (harvestWithSameName && harvestWithSameName.id !== id) {
        throw new ConflictException(
          'Já existe outra safra cadastrada com este nome.',
        );
      }
    }

    const harvest = await this.prisma.harvest.update({
      where: {
        id,
      },
      data: {
        ...(name && {
          name,
        }),
      },
    });

    this.logger.log(`Harvest updated. harvestId=${harvest.id}`);

    return harvest;
  }

  async remove(id: string) {
    const harvest = await this.prisma.harvest.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!harvest) {
      throw new NotFoundException('Safra não encontrada.');
    }

    if (harvest.status === RecordStatus.INACTIVE) {
      return {
        message: 'Safra já estava inativa.',
      };
    }

    await this.prisma.harvest.update({
      where: {
        id,
      },
      data: {
        status: RecordStatus.INACTIVE,
        inactiveAt: new Date(),
      },
    });

    this.logger.log(`Harvest inactivated. harvestId=${id}`);

    return {
      message: 'Safra inativada com sucesso.',
    };
  }

  private async ensureActiveHarvestExists(id: string) {
    const harvest = await this.prisma.harvest.findFirst({
      where: {
        id,
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (!harvest) {
      throw new NotFoundException('Safra não encontrada ou inativa.');
    }

    return harvest;
  }

  private normalizeName(name: string) {
    return name.trim();
  }
}
