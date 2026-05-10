import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RejectClientUserIdPipe } from './common/pipes/reject-client-user-id.pipe';
import { appEnv } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: appEnv.FRONTEND_ORIGIN,
    credentials: true,
  });
  app.useBodyParser('json', { limit: '1mb' });
  app.useGlobalPipes(new RejectClientUserIdPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  await app.listen(appEnv.PORT);
}
bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
