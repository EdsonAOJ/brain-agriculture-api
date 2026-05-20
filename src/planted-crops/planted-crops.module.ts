import { Module } from '@nestjs/common';
import { PlantedCropsController } from './planted-crops.controller';
import { PlantedCropsService } from './planted-crops.service';

@Module({
  controllers: [PlantedCropsController],
  providers: [PlantedCropsService],
})
export class PlantedCropsModule {}
