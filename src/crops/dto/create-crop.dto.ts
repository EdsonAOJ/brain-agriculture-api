import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCropDto {
  @ApiProperty({
    example: 'Soja',
    description: 'Nome da cultura plantada.',
  })
  @IsString({
    message: 'O nome da cultura deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O nome da cultura é obrigatório.',
  })
  @MaxLength(80, {
    message: 'O nome da cultura deve ter no máximo 80 caracteres.',
  })
  name!: string;
}
