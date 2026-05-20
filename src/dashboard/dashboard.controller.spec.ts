import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  const dashboardServiceMock = {
    getSummary: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new DashboardController(
      dashboardServiceMock as unknown as DashboardService,
    );
  });

  it('should return dashboard summary from service', async () => {
    const summary = {
      totalFarms: 1,
      totalHectares: 1000,
      farmsByState: [
        {
          state: 'SP',
          total: 1,
        },
      ],
      farmsByCrop: [
        {
          crop: 'Soja',
          total: 1,
        },
      ],
      landUse: {
        agriculturalArea: 700,
        vegetationArea: 250,
      },
    };

    dashboardServiceMock.getSummary.mockResolvedValue(summary);

    await expect(controller.getSummary()).resolves.toEqual(summary);
    expect(dashboardServiceMock.getSummary).toHaveBeenCalledTimes(1);
  });
});
