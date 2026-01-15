import { Injectable } from '@nestjs/common';
import { StripeService } from 'src/stripe/stripe.service';
import { SubscriptionsService } from 'src/subscribtion/subscribtion.service';
import { UsersService } from 'src/user/user.service';

@Injectable()
export class BillingService {
  constructor(
    private stripe: StripeService,
    private users: UsersService,
    private subs: SubscriptionsService,
  ) {}

  async startTrial(userId: string, email: string) {
    let user = await this.users.findById(userId);

    if (!user) {
      user = await this.users.create({
        id: userId,
        email,
      });
    }

    if (!user.stripeCustomerId) {
      const customer = await this.stripe.createCustomer(email);
      user = await this.users.update(userId, {
        stripeCustomerId: customer.id,
      });
    }

    const subscription = await this.stripe.createSubscription(
      user.stripeCustomerId!,
      process.env.STRIPE_PRICE_ID!,
    );

    await this.subs.sync(subscription);

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEnd: subscription.trial_end,
    };
  }

  async createSubscriptionForCustomer(customerId: string) {
    return this.stripe.createSubscription(
      customerId,
      process.env.STRIPE_PRICE_ID!,
    );
  }
}
