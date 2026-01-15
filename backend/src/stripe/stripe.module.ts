import { Module } from '@nestjs/common';

import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe.webhook.controller';
import { PaymentsModule } from 'src/payment/payment.module';

@Module({
  controllers: [StripeWebhookController, PaymentsModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
