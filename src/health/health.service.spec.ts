import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  const prismaMock = {
    $queryRaw: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new HealthService(prismaMock as unknown as PrismaService);
  });

  it('should return healthy status when database is available', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.check();

    expect(result).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'brain-agriculture-api',
        database: 'up',
      }),
    );

    expect(result.timestamp).toEqual(expect.any(String));
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should throw ServiceUnavailableException when database query fails', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('Database unavailable'));

    await expect(service.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
