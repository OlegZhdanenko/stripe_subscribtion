import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(email: string) {
    return this.prisma.user.create({ data: { email } });
  }

  attachCustomer(userId: string, customerId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  setPlan(customerId: string, active: boolean) {
    return this.prisma.user.update({
      where: { stripeCustomerId: customerId },
      data: {
        isSubscriptionActive: active,
        plan: active ? 'pro' : 'free',
      },
    });
  }
}
