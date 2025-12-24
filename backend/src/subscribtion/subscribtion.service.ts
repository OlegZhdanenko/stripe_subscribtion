import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async sync(sub: Stripe.Subscription) {
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: sub.customer as string },
    });

    if (!user) return;

    await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      update: {
        status: sub.status,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        currentPeriodEnd: new Date(sub.currentPeriodEnd * 1000),
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0].price.id,
        status: sub.status,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        currentPeriodEnd: new Date(sub.currentPeriodEnd * 1000),
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
}
