import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Check API and database health status',
    description:
      'Checks if the API is running and if the PostgreSQL database connection is available.',
  })
  @ApiOkResponse({
    description: 'API and database are healthy.',
    schema: {
      example: {
        status: 'ok',
        service: 'brain-agriculture-api',
        database: 'up',
        timestamp: '2026-05-19T22:00:00.000Z',
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'Database is unavailable.',
    type: ErrorResponseDto,
  })
  check() {
    return this.healthService.check();
  }
}
