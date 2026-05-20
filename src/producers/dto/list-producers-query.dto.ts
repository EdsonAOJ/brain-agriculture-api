import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListProducersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'joao',
    description: 'Busca por nome ou CPF/CNPJ do produtor.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
