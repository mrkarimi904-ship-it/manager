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

  // Only enable Swagger when running via npm run start:dev (NODE_ENV=development)
  const isDevelopment = process.env.NODE_ENV === 'development';
  // if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('VMS Manager')
      .setDescription('The VMS Manager API')
      .setVersion('1.24')
      .addBearerAuth()
      .addServer('/')
      .addServer('/manager/')
      .addServer('/test_manager/')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    fs.writeFileSync("./client/swagger.json", JSON.stringify(document));
    SwaggerModule.setup('', app, document, { swaggerOptions: { tagsSorter: 'alpha'} });
  // }

  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('/manager') // for lpr only
  await app.listen(3004); // for lpr only
  // await app.listen(3001);
}
bootstrap();
