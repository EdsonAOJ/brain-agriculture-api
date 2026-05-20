import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'API root',
    description: 'Returns basic API information and useful links.',
  })
  @ApiOkResponse({
    description: 'API root information.',
    schema: {
      example: {
        name: 'Brain Agriculture API',
        status: 'running',
        docs: '/docs',
        health: '/health',
        dashboard: '/dashboard/summary',
      },
    },
  })
  getRoot() {
    return {
      name: 'Brain Agriculture API',
      status: 'running',
      docs: '/docs',
      health: '/health',
      dashboard: '/dashboard/summary',
    };
  }
}
