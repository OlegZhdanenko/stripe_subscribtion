import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async recordTrialCharge(userId: string, paymentIntent: Stripe.PaymentIntent) {
    const chargeId =
      typeof paymentIntent.latest_charge === 'string'
        ? paymentIntent.latest_charge
        : paymentIntent.latest_charge?.id;

    await this.prisma.payment.create({
      data: {
        userId,
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: chargeId || null,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    });
  }

  async recordInvoicePayment(invoice: Stripe.Invoice) {
    const customerId =
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id;

    if (!customerId) return;

    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) return;

    const chargeId = (invoice as any).charge;

    await this.prisma.payment.create({
      data: {
        userId: user.id,
        stripeInvoiceId: invoice.id,
        stripeChargeId: typeof chargeId === 'string' ? chargeId : chargeId?.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
      },
    });
  }
}
