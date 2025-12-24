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
    const customer = await this.stripe.createCustomer(email);

    await this.users.attachCustomer(userId, customer.id);

    return this.stripe.createSubscription(customer.id);
  }
}
