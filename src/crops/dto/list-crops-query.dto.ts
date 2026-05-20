import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListCropsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'soja',
    description: 'Busca pelo nome da cultura.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;
}
