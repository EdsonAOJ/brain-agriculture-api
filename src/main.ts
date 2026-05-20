/* istanbul ignore file */

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createAppValidationPipe } from './common/pipes/app-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(createAppValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Brain Agriculture API')
    .setDescription(
      'API REST para gerenciamento de produtores rurais, propriedades rurais, safras, culturas plantadas e dashboard agrícola.',
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Monitoramento de saúde da API e banco de dados.')
    .addTag('Producers', 'Cadastro e gestão de produtores rurais.')
    .addTag('Farms', 'Cadastro e gestão de propriedades rurais.')
    .addTag('Harvests', 'Cadastro e gestão de safras.')
    .addTag('Crops', 'Cadastro e gestão de culturas agrícolas.')
    .addTag(
      'Planted Crops',
      'Registro de culturas plantadas por propriedade rural e safra.',
    )
    .addTag('Dashboard', 'Indicadores agregados para gráficos e totais.')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3333;

  await app.listen(port, '0.0.0.0');

  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger docs available on http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application.', error);
  process.exit(1);
});
