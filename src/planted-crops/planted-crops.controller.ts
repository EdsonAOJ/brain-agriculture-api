import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreatePlantedCropDto } from './dto/create-planted-crop.dto';
import { ListPlantedCropsQueryDto } from './dto/list-planted-crops-query.dto';
import { PlantedCropsService } from './planted-crops.service';

@ApiTags('Planted Crops')
@Controller()
export class PlantedCropsController {
  constructor(private readonly plantedCropsService: PlantedCropsService) {}

  @Post('farms/:farmId/planted-crops')
  @ApiOperation({
    summary: 'Register a planted crop for a farm and harvest',
    description:
      'Registers a crop planted in an active farm during an active harvest. The crop, harvest and farm must be active. The same active combination of farm, harvest and crop cannot be duplicated.',
  })
  @ApiParam({
    name: 'farmId',
    description: 'Active farm ID.',
  })
  @ApiCreatedResponse({
    description: 'Planted crop successfully registered.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Farm, harvest or crop not found or inactive.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description:
      'The crop is already registered for this farm and harvest as an active record.',
    type: ErrorResponseDto,
  })
  create(@Param('farmId') farmId: string, @Body() dto: CreatePlantedCropDto) {
    return this.plantedCropsService.create(farmId, dto);
  }

  @Get('farms/:farmId/planted-crops')
  @ApiOperation({
    summary: 'List planted crops by farm with pagination and filters',
    description:
      'Returns active planted crops for an active farm. Supports pagination and filtering by cropId and harvestId.',
  })
  @ApiParam({
    name: 'farmId',
    description: 'Active farm ID.',
  })
  @ApiOkResponse({
    description: 'Planted crops successfully listed.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Farm not found or inactive.',
    type: ErrorResponseDto,
  })
  findAllByFarm(
    @Param('farmId') farmId: string,
    @Query() query: ListPlantedCropsQueryDto,
  ) {
    return this.plantedCropsService.findAllByFarm(farmId, query);
  }

  @Get('planted-crops/:id')
  @ApiOperation({
    summary: 'Get planted crop by ID',
    description:
      'Returns an active planted crop by ID, including farm, harvest and crop data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Planted crop ID.',
  })
  @ApiOkResponse({
    description: 'Planted crop successfully found.',
  })
  @ApiNotFoundResponse({
    description: 'Planted crop not found or inactive.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.plantedCropsService.findOne(id);
  }

  @Delete('planted-crops/:id')
  @ApiOperation({
    summary: 'Inactivate planted crop',
    description:
      'Performs a soft delete by setting the planted crop status to INACTIVE and filling inactiveAt.',
  })
  @ApiParam({
    name: 'id',
    description: 'Planted crop ID.',
  })
  @ApiOkResponse({
    description: 'Planted crop successfully inactivated.',
  })
  @ApiNotFoundResponse({
    description: 'Planted crop not found.',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.plantedCropsService.remove(id);
  }
}
