import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Número da página.',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'A página deve ser um número inteiro.',
  })
  @Min(1, {
    message: 'A página deve ser maior ou igual a 1.',
  })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade de registros por página.',
    default: 10,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'O limite deve ser um número inteiro.',
  })
  @Min(1, {
    message: 'O limite deve ser maior ou igual a 1.',
  })
  @Max(100, {
    message: 'O limite máximo por página é 100.',
  })
  limit?: number = 10;
}
