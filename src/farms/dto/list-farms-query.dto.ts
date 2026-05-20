import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListFarmsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'boa vista',
    description: 'Busca por nome da fazenda ou cidade.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    example: 'SP',
    description: 'Filtro por UF da fazenda.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;
}
