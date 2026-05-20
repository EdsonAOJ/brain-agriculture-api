import { ProducersController } from './producers.controller';
import { ProducersService } from './producers.service';

describe('ProducersController', () => {
  let controller: ProducersController;

  const producersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new ProducersController(
      producersServiceMock as unknown as ProducersService,
    );
  });

  it('should create a producer', async () => {
    const dto = {
      document: '529.982.247-25',
      name: 'João da Silva',
    };

    const producer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: 'CPF',
      name: 'João da Silva',
      status: 'ACTIVE',
    };

    producersServiceMock.create.mockResolvedValue(producer);

    await expect(controller.create(dto)).resolves.toEqual(producer);
    expect(producersServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should list producers', async () => {
    const query = {
      page: 1,
      limit: 10,
      search: 'joao',
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

    producersServiceMock.findAll.mockResolvedValue(response);

    await expect(controller.findAll(query)).resolves.toEqual(response);
    expect(producersServiceMock.findAll).toHaveBeenCalledWith(query);
  });

  it('should find one producer by id', async () => {
    const producer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: 'CPF',
      name: 'João da Silva',
      status: 'ACTIVE',
    };

    producersServiceMock.findOne.mockResolvedValue(producer);

    await expect(controller.findOne('producer-id')).resolves.toEqual(producer);
    expect(producersServiceMock.findOne).toHaveBeenCalledWith('producer-id');
  });

  it('should update a producer', async () => {
    const dto = {
      name: 'João Atualizado',
    };

    const producer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: 'CPF',
      name: 'João Atualizado',
      status: 'ACTIVE',
    };

    producersServiceMock.update.mockResolvedValue(producer);

    await expect(controller.update('producer-id', dto)).resolves.toEqual(
      producer,
    );
    expect(producersServiceMock.update).toHaveBeenCalledWith(
      'producer-id',
      dto,
    );
  });

  it('should inactivate a producer', async () => {
    const producer = {
      id: 'producer-id',
      document: '52998224725',
      documentType: 'CPF',
      name: 'João da Silva',
      status: 'INACTIVE',
    };

    producersServiceMock.remove.mockResolvedValue(producer);

    await expect(controller.remove('producer-id')).resolves.toEqual(producer);
    expect(producersServiceMock.remove).toHaveBeenCalledWith('producer-id');
  });
});
