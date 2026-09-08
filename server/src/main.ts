import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody is required to verify webhook HMAC signatures over the exact bytes.
  // bodyParser is disabled so json/urlencoded parsers can be re-registered with
  // a raised limit below; chat debug sends base64 images/videos inline as JSON.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bodyParser: false,
  });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  // CORS_ORIGIN accepts a comma-separated list so the dev server can move to
  // the next free port (5173 -> 5174 -> ...) without editing the config.
  const corsOrigin = config
    .get<string>('CORS_ORIGIN', 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Body parsers must come after CORS so error responses (e.g. 413) still
  // carry CORS headers. The limit is raised because chat debug sends base64
  // images/videos inline as JSON; the default 100kb rejects a small image.
  const bodyLimit = config.get<string>('BODY_LIMIT', '50mb');
  app.useBodyParser('json', { limit: bodyLimit });
  app.useBodyParser('urlencoded', { limit: bodyLimit, extended: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`ZCL Flow server running at http://localhost:${port}/api`);
}

bootstrap();
