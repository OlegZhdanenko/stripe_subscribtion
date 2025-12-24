import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT;
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
  });
  await app.listen(PORT ?? 3000);
  console.log(`Server listen on port ${PORT}`);
}
bootstrap().catch((err) => console.log(err));
