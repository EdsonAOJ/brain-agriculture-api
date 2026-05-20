import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { ListCropsQueryDto } from './dto/list-crops-query.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/utils/pagination';

@Injectable()
export class CropsService {
  private readonly logger = new Logger(CropsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCropDto) {
    const name = this.normalizeName(dto.name);

    const existingCrop = await this.prisma.crop.findUnique({
      where: {
        name,
      },
    });

    if (existingCrop) {
      throw new ConflictException(
        'Já existe uma cultura cadastrada com este nome.',
      );
    }

    const crop = await this.prisma.crop.create({
      data: {
        name,
        status: RecordStatus.ACTIVE,
      },
    });

    this.logger.log(`Crop created. cropId=${crop.id}`);

    return crop;
  }

  async findAll(query: ListCropsQueryDto) {
    const { page, limit, skip, take } = getPaginationParams(query);

    const where: Prisma.CropWhereInput = {
      status: RecordStatus.ACTIVE,
    };

    const search = query.search?.trim();

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [crops, total] = await Promise.all([
      this.prisma.crop.findMany({
        where,
        skip,
        take,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.crop.count({
        where,
      }),
    ]);

    return buildPaginatedResponse({
      data: crops,
      total,
      page,
      limit,
    });
  }
  async findOne(id: string) {
    const crop = await this.prisma.crop.findFirst({
      where: {
        id,
        status: RecordStatus.ACTIVE,
      },
    });

    if (!crop) {
      throw new NotFoundException('Cultura não encontrada.');
    }

    return crop;
  }

  async update(id: string, dto: UpdateCropDto) {
    await this.ensureActiveCropExists(id);

    let name: string | undefined;

    if (dto.name) {
      name = this.normalizeName(dto.name);

      const cropWithSameName = await this.prisma.crop.findUnique({
        where: {
          name,
        },
      });

      if (cropWithSameName && cropWithSameName.id !== id) {
        throw new ConflictException(
          'Já existe outra cultura cadastrada com este nome.',
        );
      }
    }

    const crop = await this.prisma.crop.update({
      where: {
        id,
      },
      data: {
        ...(name && {
          name,
        }),
      },
    });

    this.logger.log(`Crop updated. cropId=${crop.id}`);

    return crop;
  }

  async remove(id: string) {
    const crop = await this.prisma.crop.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!crop) {
      throw new NotFoundException('Cultura não encontrada.');
    }

    if (crop.status === RecordStatus.INACTIVE) {
      return {
        message: 'Cultura já estava inativa.',
      };
    }

    await this.prisma.crop.update({
      where: {
        id,
      },
      data: {
        status: RecordStatus.INACTIVE,
        inactiveAt: new Date(),
      },
    });

    this.logger.log(`Crop inactivated. cropId=${id}`);

    return {
      message: 'Cultura inativada com sucesso.',
    };
  }

  private async ensureActiveCropExists(id: string) {
    const crop = await this.prisma.crop.findFirst({
      where: {
        id,
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (!crop) {
      throw new NotFoundException('Cultura não encontrada ou inativa.');
    }

    return crop;
  }

  private normalizeName(name: string) {
    return name.trim();
  }
}
