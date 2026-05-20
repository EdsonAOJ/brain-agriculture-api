import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({
    example: 1,
    description: 'Página atual.',
  })
  page!: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade de registros por página.',
  })
  limit!: number;

  @ApiProperty({
    example: 35,
    description: 'Total de registros encontrados.',
  })
  total!: number;

  @ApiProperty({
    example: 4,
    description: 'Total de páginas disponíveis.',
  })
  totalPages!: number;
}

export class PaginatedResponseDto<TData> {
  @ApiProperty({
    description: 'Lista de registros da página atual.',
    isArray: true,
  })
  data!: TData[];

  @ApiProperty({
    description: 'Metadados da paginação.',
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto;
}
