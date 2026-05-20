import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CreateFarmDto } from './dto/create-farm.dto';
import { ListFarmsQueryDto } from './dto/list-farms-query.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { FarmsService } from './farms.service';

@ApiTags('Farms')
@Controller()
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post('producers/:producerId/farms')
  @ApiOperation({
    summary: 'Create a farm for a rural producer',
    description:
      'Creates a rural property linked to an active producer. Validates that agricultural area plus vegetation area does not exceed total area.',
  })
  @ApiParam({
    name: 'producerId',
    description: 'Active rural producer ID.',
  })
  @ApiCreatedResponse({
    description: 'Farm successfully created.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body or invalid area rule. The sum of agricultural and vegetation areas cannot exceed total area.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Producer not found or inactive.',
    type: ErrorResponseDto,
  })
  create(@Param('producerId') producerId: string, @Body() dto: CreateFarmDto) {
    return this.farmsService.create(producerId, dto);
  }

  @Get('producers/:producerId/farms')
  @ApiOperation({
    summary: 'List farms by rural producer with pagination and filters',
    description:
      'Returns active farms linked to an active producer. Supports pagination, search by farm name or city, and filtering by state.',
  })
  @ApiParam({
    name: 'producerId',
    description: 'Active rural producer ID.',
  })
  @ApiOkResponse({
    description: 'Farms successfully listed.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Producer not found or inactive.',
    type: ErrorResponseDto,
  })
  findAllByProducer(
    @Param('producerId') producerId: string,
    @Query() query: ListFarmsQueryDto,
  ) {
    return this.farmsService.findAllByProducer(producerId, query);
  }

  @Get('farms/:id')
  @ApiOperation({
    summary: 'Get farm by ID',
    description:
      'Returns an active farm by ID, including producer and active planted crops.',
  })
  @ApiParam({
    name: 'id',
    description: 'Farm ID.',
  })
  @ApiOkResponse({
    description: 'Farm successfully found.',
  })
  @ApiNotFoundResponse({
    description: 'Farm not found or inactive.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.farmsService.findOne(id);
  }

  @Patch('farms/:id')
  @ApiOperation({
    summary: 'Update farm',
    description:
      'Updates an active farm. When area fields are updated, the API revalidates the rule agricultural area plus vegetation area must not exceed total area.',
  })
  @ApiParam({
    name: 'id',
    description: 'Farm ID.',
  })
  @ApiOkResponse({
    description: 'Farm successfully updated.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request body or invalid area rule. The sum of agricultural and vegetation areas cannot exceed total area.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Farm not found or inactive.',
    type: ErrorResponseDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateFarmDto) {
    return this.farmsService.update(id, dto);
  }

  @Delete('farms/:id')
  @ApiOperation({
    summary: 'Inactivate farm',
    description:
      'Performs a soft delete by setting the farm status to INACTIVE and filling inactiveAt.',
  })
  @ApiParam({
    name: 'id',
    description: 'Farm ID.',
  })
  @ApiOkResponse({
    description: 'Farm successfully inactivated.',
  })
  @ApiNotFoundResponse({
    description: 'Farm not found.',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.farmsService.remove(id);
  }
}
