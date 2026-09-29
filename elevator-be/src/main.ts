import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_ROUTES } from './domain/constants/api-routes.constants';
import { SYSTEM_MESSAGES } from './domain/constants/messages.constants';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho toàn bộ frontend React kết nối
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Response Transform Interceptor (Centralized Response Wrapping)
  app.useGlobalInterceptors(new TransformInterceptor());

  // Cấu hình Swagger OpenAPI theo Best Practices
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Elevator Simulator API')
    .setDescription(
      'Real-time Multi-Elevator Simulator System API powered by NestJS, WebSocket, and Domain-Driven OOP Architecture.\n\n' +
        '**Key Features:**\n' +
        '- **3 Parallel Elevators** traversing across 10 floors.\n' +
        '- **LOOK / SCAN Algorithm** with Directional Stopping guarantees.\n' +
        '- **Nearest Suitable Dispatching Strategy** (Strategy Pattern).\n' +
        '- **Interactive Door Lifecycle** with Dwell Timer and Instant Open/Close overrides.\n' +
        '- **Realtime WebSocket Gateway** broadcasting tick snapshots and arrival events.',
    )
    .setVersion('1.0.0')
    .addTag('Elevators', 'Realtime elevator operations, dispatching, car selection, and door management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(API_ROUTES.DOCS, app, document, {
    customSiteTitle: 'Elevator Simulator API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  logger.log(SYSTEM_MESSAGES.LOG.SERVER_RUNNING(PORT));
  logger.log(SYSTEM_MESSAGES.LOG.SWAGGER_AVAILABLE(PORT));
}

bootstrap();
