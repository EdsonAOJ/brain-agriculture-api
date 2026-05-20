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
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { ProducersService } from './producers.service';
import { ListProducersQueryDto } from './dto/list-producers-query.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('Producers')
@Controller('producers')
export class ProducersController {
  constructor(private readonly producersService: ProducersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a rural producer',
    description:
      'Creates a rural producer after validating CPF/CNPJ and checking document uniqueness.',
  })
  @ApiCreatedResponse({
    description: 'Rural producer successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid CPF/CNPJ or invalid request body.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'A producer with the same CPF/CNPJ already exists.',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateProducerDto) {
    return this.producersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List rural producers with pagination and filters',
    description:
      'Returns active rural producers using pagination. Supports search by name or CPF/CNPJ.',
  })
  @ApiOkResponse({
    description: 'Rural producers successfully listed.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters.',
    type: ErrorResponseDto,
  })
  findAll(@Query() query: ListProducersQueryDto) {
    return this.producersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get rural producer by ID',
    description:
      'Returns an active rural producer by ID, including active farms and planted crops.',
  })
  @ApiParam({
    name: 'id',
    description: 'Rural producer ID.',
  })
  @ApiOkResponse({
    description: 'Rural producer successfully found.',
  })
  @ApiNotFoundResponse({
    description: 'Rural producer not found or inactive.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.producersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update rural producer',
    description:
      'Updates an active rural producer. If CPF/CNPJ is changed, the document is validated and checked for uniqueness.',
  })
  @ApiParam({
    name: 'id',
    description: 'Rural producer ID.',
  })
  @ApiOkResponse({
    description: 'Rural producer successfully updated.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid CPF/CNPJ or invalid request body.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Another producer with the same CPF/CNPJ already exists.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Rural producer not found or inactive.',
    type: ErrorResponseDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateProducerDto) {
    return this.producersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Inactivate rural producer',
    description:
      'Performs a soft delete by setting the producer status to INACTIVE and filling inactiveAt.',
  })
  @ApiParam({
    name: 'id',
    description: 'Rural producer ID.',
  })
  @ApiOkResponse({
    description: 'Rural producer successfully inactivated.',
  })
  @ApiNotFoundResponse({
    description: 'Rural producer not found.',
    type: ErrorResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.producersService.remove(id);
  }
}
