import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListPlantedCropsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'e8c6e7c9-2f19-4c2f-85bb-8b0a9c9a2b13',
    description: 'Filtro por ID da cultura.',
  })
  @IsOptional()
  @IsUUID()
  cropId?: string;

  @ApiPropertyOptional({
    example: 'd7c5c5a2-8a64-48ad-b9a5-985a39f2f6d7',
    description: 'Filtro por ID da safra.',
  })
  @IsOptional()
  @IsUUID()
  harvestId?: string;
}
