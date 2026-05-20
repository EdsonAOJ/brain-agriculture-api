import { CropsController } from './crops.controller';
import { CropsService } from './crops.service';

describe('CropsController', () => {
  let controller: CropsController;

  const cropsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new CropsController(
      cropsServiceMock as unknown as CropsService,
    );
  });

  it('should create a crop', async () => {
    const dto = {
      name: 'Soja',
    };

    const crop = {
      id: 'crop-id',
      name: 'Soja',
      status: 'ACTIVE',
    };

    cropsServiceMock.create.mockResolvedValue(crop);

    await expect(controller.create(dto)).resolves.toEqual(crop);
    expect(cropsServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should list crops', async () => {
    const query = {
      page: 1,
      limit: 10,
      search: 'soja',
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

    cropsServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(query)).resolves.toEqual(response);
    expect(cropsServiceMock.findAll).toHaveBeenCalledWith(query);
  });

  it('should find one crop by id', async () => {
    const crop = {
      id: 'crop-id',
      name: 'Soja',
      status: 'ACTIVE',
    };

    cropsServiceMock.findOne.mockResolvedValue(crop);

    await expect(controller.findOne('crop-id')).resolves.toEqual(crop);
    expect(cropsServiceMock.findOne).toHaveBeenCalledWith('crop-id');
  });

  it('should update a crop', async () => {
    const dto = {
      name: 'Milho',
    };

    const crop = {
      id: 'crop-id',
      name: 'Milho',
      status: 'ACTIVE',
    };

    cropsServiceMock.update.mockResolvedValue(crop);

    await expect(controller.update('crop-id', dto)).resolves.toEqual(crop);
    expect(cropsServiceMock.update).toHaveBeenCalledWith('crop-id', dto);
  });

  it('should inactivate a crop', async () => {
    const crop = {
      id: 'crop-id',
      name: 'Soja',
      status: 'INACTIVE',
    };

    cropsServiceMock.remove.mockResolvedValue(crop);

    await expect(controller.remove('crop-id')).resolves.toEqual(crop);
    expect(cropsServiceMock.remove).toHaveBeenCalledWith('crop-id');
  });
});
