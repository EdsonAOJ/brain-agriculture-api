import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code.',
  })
  statusCode?: number;

  @ApiProperty({
    example: 'CPF ou CNPJ inválido.',
    description: 'Mensagem de erro retornada pela API.',
  })
  message?: string | string[];

  @ApiProperty({
    example: 'Bad Request',
    description: 'Descrição curta do erro HTTP.',
  })
  error?: string;

  @ApiProperty({
    example: '/producers',
    description: 'Caminho da requisição.',
  })
  path?: string;

  @ApiProperty({
    example: 'POST',
    description: 'Método HTTP utilizado.',
  })
  method?: string;

  @ApiProperty({
    example: '2026-05-19T22:00:00.000Z',
    description: 'Data e hora em que o erro ocorreu.',
  })
  timestamp?: string;

  @ApiPropertyOptional({
    example: '8fdf05d4-56de-49d3-85f3-d2b5e5ef9b3d',
    description: 'Identificador da requisição para rastreabilidade.',
  })
  requestId?: string;
}
