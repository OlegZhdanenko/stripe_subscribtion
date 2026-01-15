import {
  Controller,
  Get,
  Post,
  Headers,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionsService } from './subscribtion.service';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payment/payment.service';

@Controller('subscription')
export class SubscriptionsController {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private stripeService: StripeService,
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

  @Post('trial-charge')
  async createTrialCharge(
    @Headers('x-user-id') userId: string,
    @Body() body: { paymentMethodId: string; email: string },
  ) {
    console.log('trial-charge');

    try {
      let user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            id: userId,
            email: body.email,
          },
        });
      }

      if (!user.stripeCustomerId) {
        const customer = await this.stripeService.createCustomer(body.email);
        user = await this.prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customer.id },
        });
      }

      await this.stripeService.attachPaymentMethod(
        body.paymentMethodId,
        user.stripeCustomerId!,
      );

      const paymentIntent = await this.stripeService.createTrialCharge(
        body.paymentMethodId,
        user.stripeCustomerId!,
      );

      await this.paymentsService.recordTrialCharge(user.id, paymentIntent);

      return { success: true, paymentIntentId: paymentIntent.id };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Trial charge failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('subscribe')
  async subscribe(@Headers('x-user-id') userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.stripeCustomerId) {
        throw new Error('User not found or no Stripe customer');
      }

      const subscription = await this.stripeService.createSubscription(
        user.stripeCustomerId,
        process.env.STRIPE_PRICE_ID!,
      );

      await this.subscriptionsService.sync(subscription);

      return { success: true, subscriptionId: subscription.id };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Subscription creation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('status')
  async getStatus(@Headers('x-user-id') userId: string) {
    console.log('status');

    if (!userId) {
      return { status: 'none', plan: 'free', isActive: false };
    }

    return this.subscriptionsService.getStatus(userId);
  }

  @Post('cancel')
  async cancel(@Headers('x-user-id') userId: string) {
    try {
      if (!userId) {
        throw new Error('User ID required');
      }

      return await this.subscriptionsService.cancel(userId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Cancellation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
