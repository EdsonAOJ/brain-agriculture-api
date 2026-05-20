import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const databaseStatus = await this.checkDatabase();

    return {
      status: 'ok',
      service: 'brain-agriculture-api',
      database: databaseStatus,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<'up'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return 'up';
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'brain-agriculture-api',
        database: 'down',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
