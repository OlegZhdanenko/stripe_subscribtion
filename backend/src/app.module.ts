import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@nestjs/config';
import { StripeModule } from './stripe/stripe.module';
import { PaymentsModule } from './payments/payments.modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    StripeModule,

    MongooseModule.forRoot(process.env.MONGO_URI || ''),

    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
