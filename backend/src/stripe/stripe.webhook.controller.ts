import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { SubscriptionsService } from 'src/subscribtion/subscribtion.service';
import { PaymentsService } from 'src/prisma/payment.service';
import Stripe from 'stripe';

@Controller('stripe/webhook')
export class StripeWebhookController {
  constructor(
    private stripeService: StripeService,
    private subs: SubscriptionsService,
    private payments: PaymentsService,
  ) {}

  @Post()
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    const event = this.stripeService.verifyWebhook(req.rawBody, sig);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.subs.sync(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.payments.success(event.data.object as Stripe.Invoice);
        break;
    }

    return { received: true };
  }
}
