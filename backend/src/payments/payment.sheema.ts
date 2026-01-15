import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrialPaymentDocument = TrialPayment & Document;

@Schema({ timestamps: true })
export class TrialPayment {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  stripeCustomerId: string;

  @Prop()
  stripeSubscriptionId?: string;

  @Prop()
  stripePaymentIntentId?: string;

  @Prop({ default: 'trial' })
  plan: string;

  @Prop({
    enum: ['none', 'reserved', 'completed', 'canceled'],
    default: 'none',
  })
  status: 'none' | 'reserved' | 'completed' | 'canceled';

  @Prop()
  trialStart?: Date;

  @Prop()
  amount?: number;

  @Prop()
  trialEnd?: Date;

  @Prop()
  reservedAmount?: number;

  @Prop()
  currency?: string;
}

export const TrialPaymentSchema = SchemaFactory.createForClass(TrialPayment);
