import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
    jest.restoreAllMocks();
  });

  it('should throw when DATABASE_URL is not defined', () => {
    delete process.env.DATABASE_URL;

    expect(() => new PrismaService()).toThrow('DATABASE_URL is not defined.');
  });

  it('should instantiate when DATABASE_URL is defined', () => {
    process.env.DATABASE_URL = 'postgresql://brain:brain@localhost:5432/db';

    const service = new PrismaService();

    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    process.env.DATABASE_URL = 'postgresql://brain:brain@localhost:5432/db';

    const service = new PrismaService();

    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('should disconnect on module destroy', async () => {
    process.env.DATABASE_URL = 'postgresql://brain:brain@localhost:5432/db';

    const service = new PrismaService();

    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
