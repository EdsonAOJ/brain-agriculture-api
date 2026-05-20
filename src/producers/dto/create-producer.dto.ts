import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProducerDto {
  @ApiProperty({
    example: '529.982.247-25',
    description: 'CPF ou CNPJ do produtor rural.',
  })
  @IsString({
    message: 'O CPF/CNPJ deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O CPF/CNPJ é obrigatório.',
  })
  @MaxLength(18, {
    message: 'O CPF/CNPJ deve ter no máximo 18 caracteres.',
  })
  document!: string;

  @ApiProperty({
    example: 'João da Silva',
    description: 'Nome do produtor rural.',
  })
  @IsString({
    message: 'O nome do produtor deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O nome do produtor é obrigatório.',
  })
  @MaxLength(120, {
    message: 'O nome do produtor deve ter no máximo 120 caracteres.',
  })
  name!: string;
}
