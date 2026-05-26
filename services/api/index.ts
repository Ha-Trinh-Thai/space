import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

const expressApp = express();

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    // ----------------------------
    // GLOBAL PREFIX
    // ----------------------------
    app.setGlobalPrefix('api');

    // ----------------------------
    // GLOBAL VALIDATION PIPE
    // ----------------------------
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // ----------------------------
    // CORS (CRITICAL FIX)
    // ----------------------------
    const allowedOrigins = ['http://localhost:3000', process.env.CORS_ORIGIN].filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        // allow server-to-server / curl / postman
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.init();

    cachedServer = serverless(expressApp);
  }

  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
