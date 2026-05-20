import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHarvestDto {
  @ApiProperty({
    example: 'Safra 2021',
    description: 'Nome da safra.',
  })
  @IsString({
    message: 'O nome da safra deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O nome da safra é obrigatório.',
  })
  @MaxLength(80, {
    message: 'O nome da safra deve ter no máximo 80 caracteres.',
  })
  name!: string;
}
