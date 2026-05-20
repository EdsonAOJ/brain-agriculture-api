import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  const healthServiceMock = {
    check: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new HealthController(
      healthServiceMock as unknown as HealthService,
    );
  });

  it('should return health status from service', async () => {
    const healthResponse = {
      status: 'ok',
      service: 'brain-agriculture-api',
      database: 'up',
      timestamp: '2026-05-20T00:00:00.000Z',
    };

    healthServiceMock.check.mockResolvedValue(healthResponse);

    await expect(controller.check()).resolves.toEqual(healthResponse);
    expect(healthServiceMock.check).toHaveBeenCalledTimes(1);
  });
});
