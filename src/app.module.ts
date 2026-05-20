import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CropsModule } from './crops/crops.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { envValidationSchema } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { FarmsModule } from './farms/farms.module';
import { HarvestsModule } from './harvests/harvests.module';
import { HealthModule } from './health/health.module';
import { PlantedCropsModule } from './planted-crops/planted-crops.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProducersModule } from './producers/producers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    PrismaModule,
    HealthModule,
    ProducersModule,
    FarmsModule,
    HarvestsModule,
    CropsModule,
    PlantedCropsModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
