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
import { CreateCropDto } from './dto/create-crop.dto';
import { ListCropsQueryDto } from './dto/list-crops-query.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { CropsService } from './crops.service';

@ApiTags('Crops')
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a crop',
    description:
      'Creates an agricultural crop, such as Soja, Milho, Café or Algodão. The crop name must be unique.',
  })
  @ApiCreatedResponse({
    description: 'Crop successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'A crop with the same name already exists.',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateCropDto) {
    return this.cropsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List crops with pagination and filters',
    description:
      'Returns active crops using pagination. Supports search by crop name.',
  })
  @ApiOkResponse({
    description: 'Crops successfully listed.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
    type: ErrorResponseDto,
  })
  findAll(@Query() query: ListCropsQueryDto) {
    return this.cropsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get crop by ID',
    description: 'Returns an active crop by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Crop ID.',
  })
  @ApiOkResponse({
    description: 'Crop successfully found.',
  })
  @ApiNotFoundResponse({
    description: 'Crop not found or inactive.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.cropsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update crop',
    description:
      'Updates an active crop. If the name is changed, uniqueness is checked.',
  })
  @ApiParam({
    name: 'id',
    description: 'Crop ID.',
  })
  @ApiOkResponse({
    description: 'Crop successfully updated.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Another crop with the same name already exists.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Crop not found or inactive.',
    type: ErrorResponseDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateCropDto) {
    return this.cropsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Inactivate crop',
    description:
      'Performs a soft delete by setting the crop status to INACTIVE and filling inactiveAt.',
  })
  @ApiParam({
    name: 'id',
    description: 'Crop ID.',
  })
  @ApiOkResponse({
    description: 'Crop successfully inactivated.',
  })
  @ApiNotFoundResponse({
    description: 'Crop not found.',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.cropsService.remove(id);
  }
}
