import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/http-exception.filter';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import config from './configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  let documentConfig = new DocumentBuilder()
    .setTitle('VMS Manager')
    .setDescription('The VMS Manager API')
    .setVersion('1.24')
    .addBearerAuth();
  config.swaggerServers.forEach((s) => { documentConfig = documentConfig.addServer(s); });
  const swaggerConfig = documentConfig.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  fs.writeFileSync('./client/swagger.json', JSON.stringify(document));
  SwaggerModule.setup('', app, document, { swaggerOptions: { tagsSorter: 'alpha' } });

  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix(config.globalPrefix);
  await app.listen(config.port);
}
bootstrap();
