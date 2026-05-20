import {
  PaginatedResponseDto,
  PaginationMetaDto,
} from './paginated-response.dto';

describe('PaginatedResponseDto', () => {
  it('should instantiate pagination metadata', () => {
    const meta = new PaginationMetaDto();

    meta.page = 1;
    meta.limit = 10;
    meta.total = 35;
    meta.totalPages = 4;

    expect(meta).toEqual({
      page: 1,
      limit: 10,
      total: 35,
      totalPages: 4,
    });
  });

  it('should instantiate paginated response', () => {
    type Item = {
      id: string;
      name: string;
    };

    const response = new PaginatedResponseDto<Item>();

    response.data = [
      {
        id: 'item-id',
        name: 'Item',
      },
    ];

    response.meta = {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    };

    expect(response).toEqual({
      data: [
        {
          id: 'item-id',
          name: 'Item',
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  });
});
