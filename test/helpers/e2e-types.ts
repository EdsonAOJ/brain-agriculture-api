export interface ProducerResponse {
  id: string;
  document: string;
  documentType: 'CPF' | 'CNPJ';
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FarmResponse {
  id: string;
  producerId: string;
  name: string;
  city: string;
  state: string;
  totalArea: string | number;
  agriculturalArea: string | number;
  vegetationArea: string | number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface HarvestResponse {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CropResponse {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PlantedCropResponse {
  id: string;
  farmId: string;
  harvestId: string;
  cropId: string;
  status: 'ACTIVE' | 'INACTIVE';
  farm?: FarmResponse;
  harvest?: HarvestResponse;
  crop?: CropResponse;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  method: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardSummaryResponse {
  totalFarms: number;
  totalHectares: number;
  farmsByState: Array<{
    state: string;
    total: number;
  }>;
  farmsByCrop: Array<{
    crop: string;
    total: number;
  }>;
  landUse: {
    agriculturalArea: number;
    vegetationArea: number;
  };
}
