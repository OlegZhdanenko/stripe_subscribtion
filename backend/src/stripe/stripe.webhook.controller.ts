import { Controller, Post, Headers, Req } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { SubscriptionsService } from '../subscribtion/subscribtion.service';
import { PaymentsService } from '../payment/payment.service';
import { Request } from 'express';

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

@Controller('stripe/webhook')
export class StripeWebhookController {
  constructor(
    private stripeService: StripeService,
    private subscriptionsService: SubscriptionsService,
    private paymentsService: PaymentsService,
  ) {}

  @Post()
  async handleWebhook(
    @Req() req: RequestWithRawBody,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripeService.verifyWebhook(req.rawBody!, signature);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.subscriptionsService.sync(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.subscriptionsService.sync(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this.paymentsService.recordInvoicePayment(event.data.object);
        break;
    }

    return { received: true };
  }
}
