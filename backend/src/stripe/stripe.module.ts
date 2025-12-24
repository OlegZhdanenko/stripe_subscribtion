import { Module } from '@nestjs/common';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripeService } from './stripe.service';

@Module({
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
