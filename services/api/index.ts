import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';

const server = express();

let appReady: Promise<void>;

function bootstrap() {
  if (!appReady) {
    appReady = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
      const config = app.get(ConfigService);

      app.setGlobalPrefix('api');
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      app.enableCors({
        origin: config.get<string>('CORS_ORIGIN', '*'),
        credentials: true,
      });

      await app.init();
    })();
  }
  return appReady;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  server(req, res);
}
