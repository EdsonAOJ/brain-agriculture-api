import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePlantedCropDto {
  @ApiProperty({
    example: 'd7c5c5a2-8a64-48ad-b9a5-985a39f2f6d7',
    description: 'ID da safra relacionada ao plantio.',
  })
  @IsString({
    message: 'O ID da safra deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O ID da safra é obrigatório.',
  })
  @IsUUID('4', {
    message: 'O ID da safra deve ser um UUID válido.',
  })
  harvestId!: string;

  @ApiProperty({
    example: 'e8c6e7c9-2f19-4c2f-85bb-8b0a9c9a2b13',
    description: 'ID da cultura plantada.',
  })
  @IsString({
    message: 'O ID da cultura deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O ID da cultura é obrigatório.',
  })
  @IsUUID('4', {
    message: 'O ID da cultura deve ser um UUID válido.',
  })
  cropId!: string;
}
