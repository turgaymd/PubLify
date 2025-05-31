import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const SESSION_SECRET = configService.get<string>('SESSION_SECRET_KEY') ?? '';
  const NODE_ENV = configService.get<string>('NODE_ENV');
  const PORT = configService.get<number>('PORT') ?? 3000;

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: `${process.env.CLIENT_URL || 'http://localhost:4000'}`,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.use(
    session({
      name: 'n_sid',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: NODE_ENV === 'https-production',
        sameSite: NODE_ENV === 'https-production' ? 'none' : 'lax',
        maxAge: 30 * 60 * 1000,
        domain: NODE_ENV === 'https-production' ? '.koyeb.app' : undefined,
      },
    }),
  );

  await app.listen(PORT ?? 3000);
}

void bootstrap();
