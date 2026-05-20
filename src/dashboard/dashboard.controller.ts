import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get agricultural dashboard summary',
    description:
      'Returns aggregated data for dashboard charts: total farms, total hectares, farms by state, planted crops by crop and land use distribution.',
  })
  @ApiOkResponse({
    description: 'Dashboard summary successfully generated.',
    schema: {
      example: {
        totalFarms: 4,
        totalHectares: 5900,
        farmsByState: [
          {
            state: 'GO',
            total: 1,
          },
          {
            state: 'MG',
            total: 1,
          },
          {
            state: 'MT',
            total: 1,
          },
          {
            state: 'SP',
            total: 1,
          },
        ],
        farmsByCrop: [
          {
            crop: 'Algodão',
            total: 1,
          },
          {
            crop: 'Café',
            total: 1,
          },
          {
            crop: 'Milho',
            total: 2,
          },
          {
            crop: 'Soja',
            total: 4,
          },
        ],
        landUse: {
          agriculturalArea: 4050,
          vegetationArea: 1350,
        },
      },
    },
  })
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
