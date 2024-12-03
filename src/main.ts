import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('VMS Manager')
    .setDescription('The VMS Manager API')
    .setVersion('1.24')
    .addBearerAuth()
    .addServer('/')
    .addServer('/test_manager/')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync("./client/swagger.json", JSON.stringify(document));
  SwaggerModule.setup('', app, document, { swaggerOptions: { tagsSorter: 'alpha'} });

  app.enableCors({ origin: true, credentials: true });

  await app.listen(3001);
}
bootstrap();
