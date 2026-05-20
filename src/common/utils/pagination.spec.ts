import { buildPaginatedResponse, getPaginationParams } from './pagination';

describe('pagination utils', () => {
  describe('getPaginationParams', () => {
    it('should return default pagination params when page and limit are not provided', () => {
      const result = getPaginationParams({});

      expect(result).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
        take: 10,
      });
    });

    it('should calculate skip and take based on page and limit', () => {
      const result = getPaginationParams({
        page: 3,
        limit: 20,
      });

      expect(result).toEqual({
        page: 3,
        limit: 20,
        skip: 40,
        take: 20,
      });
    });
  });

  describe('buildPaginatedResponse', () => {
    it('should build paginated response metadata', () => {
      const result = buildPaginatedResponse({
        data: [{ id: '1' }, { id: '2' }],
        total: 25,
        page: 2,
        limit: 10,
      });

      expect(result).toEqual({
        data: [{ id: '1' }, { id: '2' }],
        meta: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });

    it('should return zero total pages when total is zero', () => {
      const result = buildPaginatedResponse({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });
});
