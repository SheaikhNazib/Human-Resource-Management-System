import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { NotFoundExceptionFilter } from './common/logger/notFoundException';
import { BadRequestExceptionFilter } from './common/logger/badRequestException';
import { UnauthorizedExceptionFilter } from './common/logger/unauthorizedException';
import { ForbiddenExceptionFilter } from './common/logger/forbiddenException';
import { SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';
import * as express from 'express';
import swaggerConfig from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    // logger: false, 
  });

  app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: [`'self'`],
            styleSrc: [`'self'`, `'unsafe-inline'`],
            imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
            scriptSrc: [`'self'`, `'https:'`, `'unsafe-inline'`],
        },
    },
    crossOriginEmbedderPolicy: false, // Required for Swagger UI
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true }
  }));
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());
  app.useGlobalFilters(
    new AllExceptionsFilter(), // This will handle all other exceptions (checked last)
    new NotFoundExceptionFilter(),
    new BadRequestExceptionFilter(),
    new UnauthorizedExceptionFilter(),
    new ForbiddenExceptionFilter(),
  );

  const configService = app.get(ConfigService);
  const port = configService.get('app.port') || 5000;
    
  SwaggerModule.setup('api-docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
    swaggerOptions: {
      cacheControl: true,
      docExpansion: 'list', // list -> auto collapse is on, none -> auto collapse is off
      persistAuthorization: true, // token is not auto logout, when link is refresh
    },
  });

  try {
    await app.listen(port);
    const baseUrl = `http://localhost:${port}`;
    console.log('\x1b[36m%s\x1b[0m', '');
    console.log('\x1b[32m%s\x1b[0m', `🚀 Server is running:     ${baseUrl}`);
    console.log('\x1b[36m%s\x1b[0m', '✅ Database connection is okay');
  } catch (err) {
    console.error('❌ Failed to start server or connect to database:', err);
  }
}

bootstrap();