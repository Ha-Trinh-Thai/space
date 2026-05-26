import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';

import { AppModule } from '../src/app.module';

const expressApp = express();

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    await nestApp.init();

    cachedServer = serverless(expressApp);
  }

  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
