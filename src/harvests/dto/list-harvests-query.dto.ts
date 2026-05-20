import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListHarvestsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: '2021',
    description: 'Busca pelo nome da safra.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;
}
