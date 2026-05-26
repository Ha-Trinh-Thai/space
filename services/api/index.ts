import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { VercelRequest, VercelResponse } from '@vercel/node';

let app;

async function getApp() {
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
      origin: 'https://space-ui-sigma.vercel.app',
      credentials: true,
    });

    await app.init();
  }

  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  const httpAdapter = app.getHttpAdapter();
  return httpAdapter.getInstance()(req, res);
}
