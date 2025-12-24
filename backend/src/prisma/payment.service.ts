import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async success(invoice: Stripe.Invoice) {
    if (!invoice.payment_intent) return;

    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: invoice.customer as string },
    });

    if (!user) return;

    await this.prisma.payment.create({
      data: {
        userId: user.id,
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: invoice.payment_intent as string,
        amount: invoice.amount_paid,
        currency: invoice.currency!,
        status: 'succeeded',
      },
    });
  }
}
