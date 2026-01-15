import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';

import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.servise';

@Controller('stripe')
export class PaymentsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('create-trial')
  async createTrial(
    @Body() body: { userId: string; email: string; priceId: string },
  ) {
    const customer = await this.stripeService.createCustomer(body.email);
    const paymentIntent = await this.stripeService.reserveOneDollar(
      customer.id,
    );
    const subscription = await this.stripeService.createTrialSubscription(
      customer.id,
      body.priceId,
      7,
    );

    await this.paymentsService.create({
      userId: body.userId,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      stripePaymentIntentId: paymentIntent.id,
      amount: 100,
      currency: 'usd',
      status: 'reserved',
      trialStart: new Date(),
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      reservedAmount: 1,
    });

    return {
      subscription,
      paymentIntentClientSecret: paymentIntent.client_secret,
    };
  }
  @Get('current-plan')
  async getCurrentPlan(@Query('userId') userId: string) {
    if (!userId) {
      return {
        plan: 'free',
        status: 'none',
      };
    }

    return this.paymentsService.getCurrentPlan(userId);
  }
  @Post('cancel-trial')
  async cancelTrial(@Query('userId') userId: string) {
    if (!userId) {
      throw new NotFoundException('UserId is required');
    }
    const trial = await this.paymentsService.findActiveTrial(userId);

    if (!trial) {
      return { success: false, message: 'No active trial found' };
    }
    await this.stripeService.cancelSubscription(trial.stripeSubscriptionId!);
    if (trial.stripePaymentIntentId) {
      await this.stripeService.cancelPaymentIntent(trial.stripePaymentIntentId);
    }

    await this.paymentsService.cancelTrial(trial._id.toString());

    return { success: true };
  }
  @Post('webhook')
  async handleWebhook(
    @Req() req: Request & { rawBody: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) return { received: true };

    let event: Stripe.Event;

    try {
      event = this.stripeService.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error('Stripe signature verification failed', err);
      return { received: true };
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;

        const exists = await this.paymentsService.findByIntentId(intent.id);
        if (!exists) {
          await this.paymentsService.create({
            userId: intent.metadata.userId,
            stripePaymentIntentId: intent.id,
            amount: intent.amount,
            currency: intent.currency,
            status: 'completed',
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.paymentsService.updateStatus(
          subscription.customer.toString(),
          'canceled',
        );
        break;
      }

      default:
        break;
    }

    return { received: true };
  }
}
