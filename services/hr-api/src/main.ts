import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const configService = app.get(ConfigService);
  const port = configService.get('app.port') || 5000;

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('HR Management API')
    .setDescription('API documentation for the HR Management system')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  try {
    await app.listen(port);
    const baseUrl = `http://localhost:${port}`;
    console.log('');
    console.log(`🚀 Server is running:     ${baseUrl}`);
    console.log('✅ Database connection is okay');
  } catch (err) {
    console.error('❌ Failed to start server or connect to database:', err);
  }
}

bootstrap();
