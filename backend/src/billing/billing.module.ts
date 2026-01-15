import { Module } from '@nestjs/common';

import { SubscriptionsModule } from 'src/subscribtion/subscribtion.module';
import { UsersModule } from 'src/user/user.module';
import { BillingService } from './billing.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { PaymentsModule } from 'src/payment/payment.module';
import { BillingController } from './billing.controller';

@Module({
  imports: [StripeModule, UsersModule, SubscriptionsModule, PaymentsModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
