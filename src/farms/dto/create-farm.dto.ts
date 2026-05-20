import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFarmDto {
  @ApiProperty({
    example: 'Fazenda Boa Vista',
    description: 'Nome da propriedade rural.',
  })
  @IsString({
    message: 'O nome da fazenda deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O nome da fazenda é obrigatório.',
  })
  @MaxLength(120, {
    message: 'O nome da fazenda deve ter no máximo 120 caracteres.',
  })
  name!: string;

  @ApiProperty({
    example: 'Ribeirão Preto',
    description: 'Cidade onde a fazenda está localizada.',
  })
  @IsString({
    message: 'A cidade deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'A cidade é obrigatória.',
  })
  @MaxLength(120, {
    message: 'A cidade deve ter no máximo 120 caracteres.',
  })
  city!: string;

  @ApiProperty({
    example: 'SP',
    description: 'Estado/UF onde a fazenda está localizada.',
  })
  @IsString({
    message: 'O estado deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O estado é obrigatório.',
  })
  @MaxLength(2, {
    message: 'O estado deve ter no máximo 2 caracteres.',
  })
  state!: string;

  @ApiProperty({
    example: 1000,
    description: 'Área total da fazenda em hectares.',
  })
  @IsNumber(
    {},
    {
      message: 'A área total deve ser um número.',
    },
  )
  @Min(0.01, {
    message: 'A área total deve ser maior que zero.',
  })
  @Max(9999999999.99, {
    message: 'A área total excede o limite permitido.',
  })
  totalArea!: number;

  @ApiProperty({
    example: 700,
    description: 'Área agricultável da fazenda em hectares.',
  })
  @IsNumber(
    {},
    {
      message: 'A área agricultável deve ser um número.',
    },
  )
  @Min(0, {
    message: 'A área agricultável não pode ser negativa.',
  })
  @Max(9999999999.99, {
    message: 'A área agricultável excede o limite permitido.',
  })
  agriculturalArea!: number;

  @ApiProperty({
    example: 250,
    description: 'Área de vegetação da fazenda em hectares.',
  })
  @IsNumber(
    {},
    {
      message: 'A área de vegetação deve ser um número.',
    },
  )
  @Min(0, {
    message: 'A área de vegetação não pode ser negativa.',
  })
  @Max(9999999999.99, {
    message: 'A área de vegetação excede o limite permitido.',
  })
  vegetationArea!: number;
}
