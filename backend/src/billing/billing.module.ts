import { Module } from '@nestjs/common';
import { PaymentsModule } from 'src/prisma/payment.module';
import { SubscriptionsModule } from 'src/subscribtion/subscribtion.module';
import { UsersModule } from 'src/user/user.module';
import { BillingService } from './billing.service';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [StripeModule, UsersModule, SubscriptionsModule, PaymentsModule],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
