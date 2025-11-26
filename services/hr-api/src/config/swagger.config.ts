import { DocumentBuilder } from '@nestjs/swagger';

// Swagger setup
export const swaggerConfig = new DocumentBuilder()
.setTitle('HR Management API')
.setDescription('API documentation for the HR Management system')
.setVersion('1.0')
.addBearerAuth(
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT',
    description: 'Enter JWT token without "Bearer" prefix',
    in: 'header',
  },
  'JWT-auth',
)
.build();

export default swaggerConfig;