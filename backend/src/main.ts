import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT;
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.setGlobalPrefix('api', {
    exclude: ['stripe/webhook'],
  });
  await app.listen(PORT ?? 8000);
  console.log(`Server listen on port ${PORT}`);
}
bootstrap().catch((err) => console.log(err));
