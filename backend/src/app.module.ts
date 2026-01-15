import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/payment.module';
import { StripeModule } from './stripe/stripe.module';
import { SubscriptionsModule } from './subscribtion/subscribtion.module';
import { PaymentsModule } from './payment/payment.module';
import { UsersModule } from './user/user.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StripeModule,
    SubscriptionsModule,
    PaymentsModule,
    UsersModule,
    BillingModule,
  ],
})
export class AppModule {}
