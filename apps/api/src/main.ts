import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 4000;
  const nodeEnv = config.get<string>('nodeEnv') ?? 'development';

  app.use(helmet());
  app.enableCors({
    origin: nodeEnv === 'production' ? [process.env['FRONTEND_URL'] ?? ''] : true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('VendorConnect API')
      .setDescription(
        `## Overview
REST API for the **VendorConnect** wedding-vendor marketplace (Sri Lanka).

Couples discover and contact vendors; vendors manage their profiles and leads.

## Authentication
All protected endpoints require a **Bearer JWT** obtained from \`POST /auth/login\` or \`POST /auth/register\`.

Include it as:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Roles
| Role | Description |
|------|-------------|
| \`COUPLE\` | Default role — browse vendors, submit inquiries, leave reviews |
| \`VENDOR\` | Manage own vendor profile, portfolio images, and leads |
| \`ADMIN\`  | Approve / reject / suspend vendor profiles |

## Error shape
All errors return:
\`\`\`json
{ "statusCode": 400, "message": "...", "error": "Bad Request", "path": "/api/v1/...", "timestamp": "..." }
\`\`\``,
      )
      .setVersion('1.0.0')
      .setContact('VendorConnect Team', '', 'mila.subscription1@gmail.com')
      .addServer(`http://localhost:${port}`, 'Local development')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Paste your JWT here' },
        'jwt',
      )
      .addTag('health', 'API health check')
      .addTag('auth', 'Register, login, and retrieve the current user')
      .addTag('categories', 'Vendor service categories (seeded, read-only at MVP)')
      .addTag('vendors', 'Vendor profile management, portfolio images, and public profiles')
      .addTag('inquiries', 'Send inquiries to vendors; vendor lead inbox')
      .addTag('reviews', 'Submit and read vendor reviews')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'VendorConnect API Docs',
    });
  }

  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}/api/v1`, 'Bootstrap');
  Logger.log(`Swagger docs: http://localhost:${port}/api/docs`, 'Bootstrap');
}

void bootstrap();
