import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
};

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      cors: true,
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const configService = app.get(ConfigService);
    const port = configService.get('app.port') || 5000;

    await app.listen(port);
    console.log(`🚀${colors.blue}Server is running on port ${port}${colors.reset}`);

    // Check database connection after server starts
    try {
      const dataSource = app.get(DataSource);
      if (dataSource && dataSource.isInitialized) {
        console.log(`✓${colors.green} Database connection successfully${colors.reset}!`);
      } else {
        throw new Error('Database not connected');
      }
    } catch (error) {
      console.log(`${colors.red}Database connection failed${colors.reset}`);
      throw error;
    }
  } catch (error) {
    const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
    const isDbError = ['database', 'connection', 'econnrefused', 'authentication', 'timeout', 'refused'].some(keyword => msg.includes(keyword));
    console.log(`${colors.red}${isDbError ? 'Database connection failed' : `Error: ${error instanceof Error ? error.message : String(error)}`}${colors.reset}`);
    process.exit(1);
  }
}

bootstrap();
