import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
  });

  await app.listen(process.env.PORT ?? 8000);
  console.log(`Server listhen on port ${process.env.PORT}`);
}

bootstrap().catch(console.error);
