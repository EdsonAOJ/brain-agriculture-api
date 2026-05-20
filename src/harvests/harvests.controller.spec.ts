import { HarvestsController } from './harvests.controller';
import { HarvestsService } from './harvests.service';

describe('HarvestsController', () => {
  let controller: HarvestsController;

  const harvestsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new HarvestsController(
      harvestsServiceMock as unknown as HarvestsService,
    );
  });

  it('should create a harvest', async () => {
    const dto = {
      name: 'Safra 2021',
    };

    const harvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: 'ACTIVE',
    };

    harvestsServiceMock.create.mockResolvedValue(harvest);

    await expect(controller.create(dto)).resolves.toEqual(harvest);
    expect(harvestsServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should list harvests', async () => {
    const query = {
      page: 1,
      limit: 10,
      search: '2021',
    };

    const response = {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    harvestsServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(query)).resolves.toEqual(response);
    expect(harvestsServiceMock.findAll).toHaveBeenCalledWith(query);
  });

  it('should find one harvest by id', async () => {
    const harvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: 'ACTIVE',
    };

    harvestsServiceMock.findOne.mockResolvedValue(harvest);

    await expect(controller.findOne('harvest-id')).resolves.toEqual(harvest);
    expect(harvestsServiceMock.findOne).toHaveBeenCalledWith('harvest-id');
  });

  it('should update a harvest', async () => {
    const dto = {
      name: 'Safra 2022',
    };

    const harvest = {
      id: 'harvest-id',
      name: 'Safra 2022',
      status: 'ACTIVE',
    };

    harvestsServiceMock.update.mockResolvedValue(harvest);

    await expect(controller.update('harvest-id', dto)).resolves.toEqual(
      harvest,
    );
    expect(harvestsServiceMock.update).toHaveBeenCalledWith('harvest-id', dto);
  });

  it('should inactivate a harvest', async () => {
    const harvest = {
      id: 'harvest-id',
      name: 'Safra 2021',
      status: 'INACTIVE',
    };

    harvestsServiceMock.remove.mockResolvedValue(harvest);

    await expect(controller.remove('harvest-id')).resolves.toEqual(harvest);
    expect(harvestsServiceMock.remove).toHaveBeenCalledWith('harvest-id');
  });
});
