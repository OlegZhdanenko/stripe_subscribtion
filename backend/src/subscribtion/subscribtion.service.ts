import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async sync(sub: Stripe.Subscription) {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) return;

    const currentPeriodEnd = (sub as any).current_period_end;

    await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      update: {
        status: sub.status,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,
        canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0].price.id,
        status: sub.status,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isSubscriptionActive:
          sub.status === 'active' || sub.status === 'trialing',
        plan:
          sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free',
      },
    });
  }

  async getStatus(userId: string) {
    console.log('status');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      return {
        status: 'none',
        plan: 'free',
        isActive: false,
      };
    }

    return {
      status: user.subscription.status,
      plan: user.plan,
      isActive: user.isSubscriptionActive,
      trialEndsAt: user.subscription.trialEndsAt?.toISOString(),
      currentPeriodEnd: user.subscription.currentPeriodEnd?.toISOString(),
    };
  }

  async cancel(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Відміна підписки в Stripe
    await this.stripeService.cancelSubscription(
      subscription.stripeSubscriptionId,
    );

    // Повернення $1 trial charge
    const trialPayment = await this.prisma.payment.findFirst({
      where: {
        userId,
        amount: 100,
        refunded: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (trialPayment?.stripeChargeId) {
      await this.stripeService.refundCharge(trialPayment.stripeChargeId);

      await this.prisma.payment.update({
        where: { id: trialPayment.id },
        data: { refunded: true },
      });
    }

    return { success: true };
  }
}
