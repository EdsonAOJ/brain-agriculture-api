import { PlantedCropsController } from './planted-crops.controller';
import { PlantedCropsService } from './planted-crops.service';

describe('PlantedCropsController', () => {
  let controller: PlantedCropsController;

  const plantedCropsServiceMock = {
    create: jest.fn(),
    findAllByFarm: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new PlantedCropsController(
      plantedCropsServiceMock as unknown as PlantedCropsService,
    );
  });

  it('should register a planted crop for a farm', async () => {
    const farmId = 'farm-id';

    const dto = {
      harvestId: 'harvest-id',
      cropId: 'crop-id',
    };

    const plantedCrop = {
      id: 'planted-crop-id',
      farmId,
      harvestId: dto.harvestId,
      cropId: dto.cropId,
      status: 'ACTIVE',
    };

    plantedCropsServiceMock.create.mockResolvedValue(plantedCrop);

    await expect(controller.create(farmId, dto)).resolves.toEqual(plantedCrop);

    expect(plantedCropsServiceMock.create).toHaveBeenCalledWith(farmId, dto);
  });

  it('should list planted crops by farm', async () => {
    const farmId = 'farm-id';

    const query = {
      page: 1,
      limit: 10,
      cropId: 'crop-id',
      harvestId: 'harvest-id',
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

    plantedCropsServiceMock.findAllByFarm.mockResolvedValue(response);

    await expect(controller.findAllByFarm(farmId, query)).resolves.toEqual(
      response,
    );

    expect(plantedCropsServiceMock.findAllByFarm).toHaveBeenCalledWith(
      farmId,
      query,
    );
  });

  it('should find one planted crop by id', async () => {
    const plantedCrop = {
      id: 'planted-crop-id',
      farmId: 'farm-id',
      harvestId: 'harvest-id',
      cropId: 'crop-id',
      status: 'ACTIVE',
    };

    plantedCropsServiceMock.findOne.mockResolvedValue(plantedCrop);

    await expect(controller.findOne('planted-crop-id')).resolves.toEqual(
      plantedCrop,
    );

    expect(plantedCropsServiceMock.findOne).toHaveBeenCalledWith(
      'planted-crop-id',
    );
  });

  it('should inactivate a planted crop', async () => {
    const plantedCrop = {
      id: 'planted-crop-id',
      farmId: 'farm-id',
      harvestId: 'harvest-id',
      cropId: 'crop-id',
      status: 'INACTIVE',
    };

    plantedCropsServiceMock.remove.mockResolvedValue(plantedCrop);

    await expect(controller.remove('planted-crop-id')).resolves.toEqual(
      plantedCrop,
    );

    expect(plantedCropsServiceMock.remove).toHaveBeenCalledWith(
      'planted-crop-id',
    );
  });
});
