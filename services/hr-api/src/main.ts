import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: false, // Suppress all NestJS logs except custom logs
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());

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
    // Colorful logs using ANSI escape codes
    console.log('\x1b[36m%s\x1b[0m', '');
    console.log('\x1b[32m%s\x1b[0m', `🚀 Server is running:     ${baseUrl}`);
    console.log('\x1b[36m%s\x1b[0m', '✅ Database connection is okay');
  } catch (err) {
    console.error('❌ Failed to start server or connect to database:', err);
  }
}

bootstrap();
