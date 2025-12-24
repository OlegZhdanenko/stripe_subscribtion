import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
  });

  createCustomer(email: string) {
    return this.stripe.customers.create({ email });
  }

  createSubscription(customerId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      trial_period_days: 7,
      payment_behavior: 'default_incomplete',
    });
  }

  verifyWebhook(payload: Buffer, sig: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }
}
