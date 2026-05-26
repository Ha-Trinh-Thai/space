import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    app.enableCors({
      origin: ['https://space-ui-sigma.vercel.app', 'http://localhost:3000'],
      methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    await app.init();
  }

  return app;
}

export default async function handler(req, res) {
  const allowedOrigins = ['https://space-ui-sigma.vercel.app', 'http://localhost:3000'];
  const origin = req.headers.origin;

  // 1. Dynamically match and set the Access-Control-Allow-Origin header
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. Intercept and immediately respond to browser preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 3. For all other methods (GET, POST, etc.), let NestJS handle the logic
  const app = await bootstrap();
  const httpAdapter = app.getHttpAdapter();
  return httpAdapter.getInstance()(req, res);
}
