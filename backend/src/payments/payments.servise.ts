import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TrialPayment, TrialPaymentDocument } from './payment.sheema';
import { Model } from 'mongoose';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(TrialPayment.name)
    private readonly model: Model<TrialPaymentDocument>,
  ) {}

  async create(data: Partial<TrialPayment>): Promise<TrialPaymentDocument> {
    return this.model.create(data);
  }

  async findByIntentId(intentId: string): Promise<TrialPaymentDocument | null> {
    return this.model.findOne({ stripePaymentIntentId: intentId });
  }
  async getCurrentPlan(userId: string) {
    const payment = await this.model
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!payment) {
      return {
        plan: 'free',
        status: 'none',
      };
    }

    return {
      plan: payment.plan ?? 'trial',
      status: payment.status,
      trialStart: payment.trialStart,
      trialEnd: payment.trialEnd,
      reservedAmount: payment.reservedAmount,
      currency: payment.currency,
    };
  }
  async updateStatus(
    userId: string,
    status: 'reserved' | 'completed' | 'canceled',
  ) {
    return this.model.updateMany({ userId, status: 'reserved' }, { status });
  }
  async findActiveTrial(userId: string) {
    return this.model.findOne({
      userId,
    });
  }

  async cancelTrial(id: string) {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: 'canceled',
      },
      { new: true },
    );
  }
}
