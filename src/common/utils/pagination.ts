export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function getPaginationParams(params: PaginationParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
}

export function buildPaginatedResponse<T>(params: {
  data: T[];
  total: number;
  page: number;
  limit: number;
}): PaginatedResponse<T> {
  return {
    data: params.data,
    meta: {
      page: params.page,
      limit: params.limit,
      total: params.total,
      totalPages: Math.ceil(params.total / params.limit),
    },
  };
}
