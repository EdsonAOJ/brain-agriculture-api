import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantedCropDto } from './dto/create-planted-crop.dto';
import { ListPlantedCropsQueryDto } from './dto/list-planted-crops-query.dto';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/utils/pagination';

@Injectable()
export class PlantedCropsService {
  private readonly logger = new Logger(PlantedCropsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(farmId: string, dto: CreatePlantedCropDto) {
    await this.ensureActiveFarmExists(farmId);
    await this.ensureActiveHarvestExists(dto.harvestId);
    await this.ensureActiveCropExists(dto.cropId);

    const existingPlantedCrop = await this.prisma.plantedCrop.findFirst({
      where: {
        farmId,
        harvestId: dto.harvestId,
        cropId: dto.cropId,
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (existingPlantedCrop) {
      throw new ConflictException(
        'Esta cultura já está registrada para esta fazenda nesta safra.',
      );
    }

    const plantedCrop = await this.prisma.plantedCrop.create({
      data: {
        farmId,
        harvestId: dto.harvestId,
        cropId: dto.cropId,
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

    this.logger.log(
      `Planted crop created. plantedCropId=${plantedCrop.id} farmId=${farmId} harvestId=${dto.harvestId} cropId=${dto.cropId}`,
    );

    return plantedCrop;
  }

  async findAllByFarm(farmId: string, query: ListPlantedCropsQueryDto) {
    await this.ensureActiveFarmExists(farmId);

    const { page, limit, skip, take } = getPaginationParams(query);

    const where: Prisma.PlantedCropWhereInput = {
      farmId,
      status: RecordStatus.ACTIVE,
    };

    if (query.cropId) {
      where.cropId = query.cropId;
    }

    if (query.harvestId) {
      where.harvestId = query.harvestId;
    }

    const [plantedCrops, total] = await Promise.all([
      this.prisma.plantedCrop.findMany({
        where,
        skip,
        take,
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
      }),
      this.prisma.plantedCrop.count({
        where,
      }),
    ]);

    return buildPaginatedResponse({
      data: plantedCrops,
      total,
      page,
      limit,
    });
  }

  async findOne(id: string) {
    const plantedCrop = await this.prisma.plantedCrop.findFirst({
      where: {
        id,
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

    if (!plantedCrop) {
      throw new NotFoundException('Cultura plantada não encontrada.');
    }

    return plantedCrop;
  }

  async remove(id: string) {
    const plantedCrop = await this.prisma.plantedCrop.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!plantedCrop) {
      throw new NotFoundException('Cultura plantada não encontrada.');
    }

    if (plantedCrop.status === RecordStatus.INACTIVE) {
      return {
        message: 'Cultura plantada já estava inativa.',
      };
    }

    await this.prisma.plantedCrop.update({
      where: {
        id,
      },
      data: {
        status: RecordStatus.INACTIVE,
        inactiveAt: new Date(),
      },
    });

    this.logger.log(`Planted crop inactivated. plantedCropId=${id}`);

    return {
      message: 'Cultura plantada inativada com sucesso.',
    };
  }

  private async ensureActiveFarmExists(farmId: string) {
    const farm = await this.prisma.farm.findFirst({
      where: {
        id: farmId,
        status: RecordStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (!farm) {
      throw new NotFoundException('Fazenda não encontrada ou inativa.');
    }

    return farm;
  }

  private async ensureActiveHarvestExists(harvestId: string) {
    const harvest = await this.prisma.harvest.findFirst({
      where: {
        id: harvestId,
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

  private async ensureActiveCropExists(cropId: string) {
    const crop = await this.prisma.crop.findFirst({
      where: {
        id: cropId,
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
}
