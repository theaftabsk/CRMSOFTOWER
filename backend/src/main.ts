import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Cookie Parser
  app.use(cookieParser());

  // Global API Prefix /api/v1
  app.setGlobalPrefix('api/v1');

  // Global Pipes, Filters, and Interceptors
  app.useGlobalPipes(CustomValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // CORS Configuration
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://app.zyvocrm.in',
        'https://app.zyvocrm.in',
        'http://zyvocrm.in',
        'https://zyvocrm.in',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.zyvocrm.in')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Enterprise SaaS CRM NestJS API Engine running on: http://localhost:${port}/api/v1`);
}
bootstrap();
