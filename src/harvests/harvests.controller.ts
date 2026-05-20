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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { ListHarvestsQueryDto } from './dto/list-harvests-query.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { HarvestsService } from './harvests.service';

@ApiTags('Harvests')
@Controller('harvests')
export class HarvestsController {
  constructor(private readonly harvestsService: HarvestsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a harvest',
    description:
      'Creates a harvest period, such as Safra 2021 or Safra 2022. The harvest name must be unique.',
  })
  @ApiCreatedResponse({
    description: 'Harvest successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'A harvest with the same name already exists.',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateHarvestDto) {
    return this.harvestsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List harvests with pagination and filters',
    description:
      'Returns active harvests using pagination. Supports search by harvest name.',
  })
  @ApiOkResponse({
    description: 'Harvests successfully listed.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
    type: ErrorResponseDto,
  })
  findAll(@Query() query: ListHarvestsQueryDto) {
    return this.harvestsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get harvest by ID',
    description: 'Returns an active harvest by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Harvest ID.',
  })
  @ApiOkResponse({
    description: 'Harvest successfully found.',
  })
  @ApiNotFoundResponse({
    description: 'Harvest not found or inactive.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.harvestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update harvest',
    description:
      'Updates an active harvest. If the name is changed, uniqueness is checked.',
  })
  @ApiParam({
    name: 'id',
    description: 'Harvest ID.',
  })
  @ApiOkResponse({
    description: 'Harvest successfully updated.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Another harvest with the same name already exists.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Harvest not found or inactive.',
    type: ErrorResponseDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateHarvestDto) {
    return this.harvestsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Inactivate harvest',
    description:
      'Performs a soft delete by setting the harvest status to INACTIVE and filling inactiveAt.',
  })
  @ApiParam({
    name: 'id',
    description: 'Harvest ID.',
  })
  @ApiOkResponse({
    description: 'Harvest successfully inactivated.',
  })
  @ApiNotFoundResponse({
    description: 'Harvest not found.',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.harvestsService.remove(id);
  }
}
