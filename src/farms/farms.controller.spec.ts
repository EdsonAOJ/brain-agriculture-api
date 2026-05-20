import { FarmsController } from './farms.controller';
import { FarmsService } from './farms.service';

describe('FarmsController', () => {
  let controller: FarmsController;

  const farmsServiceMock = {
    create: jest.fn(),
    findAllByProducer: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new FarmsController(
      farmsServiceMock as unknown as FarmsService,
    );
  });

  it('should create a farm for a producer', async () => {
    const producerId = 'producer-id';

    const dto = {
      name: 'Fazenda Boa Vista',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 250,
    };

    const farm = {
      id: 'farm-id',
      producerId,
      ...dto,
      status: 'ACTIVE',
    };

    farmsServiceMock.create.mockResolvedValue(farm);

    await expect(controller.create(producerId, dto)).resolves.toEqual(farm);

    expect(farmsServiceMock.create).toHaveBeenCalledWith(producerId, dto);
  });

  it('should list farms by producer', async () => {
    const producerId = 'producer-id';

    const query = {
      page: 1,
      limit: 10,
      search: 'boa',
      state: 'SP',
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

    farmsServiceMock.findAllByProducer.mockResolvedValue(response);

    await expect(
      controller.findAllByProducer(producerId, query),
    ).resolves.toEqual(response);

    expect(farmsServiceMock.findAllByProducer).toHaveBeenCalledWith(
      producerId,
      query,
    );
  });

  it('should find one farm by id', async () => {
    const farm = {
      id: 'farm-id',
      producerId: 'producer-id',
      name: 'Fazenda Boa Vista',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 250,
      status: 'ACTIVE',
    };

    farmsServiceMock.findOne.mockResolvedValue(farm);

    await expect(controller.findOne('farm-id')).resolves.toEqual(farm);

    expect(farmsServiceMock.findOne).toHaveBeenCalledWith('farm-id');
  });

  it('should update a farm', async () => {
    const dto = {
      name: 'Fazenda Atualizada',
      totalArea: 1200,
      agriculturalArea: 800,
      vegetationArea: 300,
    };

    const farm = {
      id: 'farm-id',
      producerId: 'producer-id',
      name: 'Fazenda Atualizada',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: 1200,
      agriculturalArea: 800,
      vegetationArea: 300,
      status: 'ACTIVE',
    };

    farmsServiceMock.update.mockResolvedValue(farm);

    await expect(controller.update('farm-id', dto)).resolves.toEqual(farm);

    expect(farmsServiceMock.update).toHaveBeenCalledWith('farm-id', dto);
  });

  it('should inactivate a farm', async () => {
    const farm = {
      id: 'farm-id',
      producerId: 'producer-id',
      name: 'Fazenda Boa Vista',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: 1000,
      agriculturalArea: 700,
      vegetationArea: 250,
      status: 'INACTIVE',
    };

    farmsServiceMock.remove.mockResolvedValue(farm);

    await expect(controller.remove('farm-id')).resolves.toEqual(farm);

    expect(farmsServiceMock.remove).toHaveBeenCalledWith('farm-id');
  });
});
