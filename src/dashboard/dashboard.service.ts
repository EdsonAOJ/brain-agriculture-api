import { Injectable, Logger } from '@nestjs/common';
import { RecordStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [totalFarms, totalAreas, farmsByState, plantedCropsByCrop] =
      await Promise.all([
        this.getTotalFarms(),
        this.getTotalAreas(),
        this.getFarmsByState(),
        this.getPlantedCropsByCrop(),
      ]);

    this.logger.log('Dashboard summary generated.');

    return {
      totalFarms,
      totalHectares: totalAreas.totalHectares,
      farmsByState,
      farmsByCrop: plantedCropsByCrop,
      landUse: {
        agriculturalArea: totalAreas.agriculturalArea,
        vegetationArea: totalAreas.vegetationArea,
      },
    };
  }

  private async getTotalFarms(): Promise<number> {
    return this.prisma.farm.count({
      where: {
        status: RecordStatus.ACTIVE,
      },
    });
  }

  private async getTotalAreas(): Promise<{
    totalHectares: number;
    agriculturalArea: number;
    vegetationArea: number;
  }> {
    const result = await this.prisma.farm.aggregate({
      where: {
        status: RecordStatus.ACTIVE,
      },
      _sum: {
        totalArea: true,
        agriculturalArea: true,
        vegetationArea: true,
      },
    });

    return {
      totalHectares: Number(result._sum.totalArea ?? 0),
      agriculturalArea: Number(result._sum.agriculturalArea ?? 0),
      vegetationArea: Number(result._sum.vegetationArea ?? 0),
    };
  }

  private async getFarmsByState(): Promise<
    Array<{
      state: string;
      total: number;
    }>
  > {
    const result = await this.prisma.farm.groupBy({
      by: ['state'],
      where: {
        status: RecordStatus.ACTIVE,
      },
      _count: {
        id: true,
      },
      orderBy: {
        state: 'asc',
      },
    });

    return result.map((item) => ({
      state: item.state,
      total: item._count.id,
    }));
  }

  private async getPlantedCropsByCrop(): Promise<
    Array<{
      crop: string;
      total: number;
    }>
  > {
    const result = await this.prisma.plantedCrop.groupBy({
      by: ['cropId'],
      where: {
        status: RecordStatus.ACTIVE,
        farm: {
          status: RecordStatus.ACTIVE,
        },
        crop: {
          status: RecordStatus.ACTIVE,
        },
        harvest: {
          status: RecordStatus.ACTIVE,
        },
      },
      _count: {
        id: true,
      },
    });

    const cropIds = result.map((item) => item.cropId);

    if (cropIds.length === 0) {
      return [];
    }

    const crops = await this.prisma.crop.findMany({
      where: {
        id: {
          in: cropIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const cropNameById = new Map(crops.map((crop) => [crop.id, crop.name]));

    return result
      .map((item) => ({
        crop: cropNameById.get(item.cropId) ?? 'Unknown',
        total: item._count.id,
      }))
      .sort((a, b) => a.crop.localeCompare(b.crop));
  }
}
