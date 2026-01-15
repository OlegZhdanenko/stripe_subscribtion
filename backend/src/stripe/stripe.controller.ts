import { Injectable } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PaymentsService {
  constructor(private stripeService: StripeService) {}

  async createPayment() {
    return this.stripeService.stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
    });
  }
}
