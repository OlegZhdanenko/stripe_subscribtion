import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrialPayment, TrialPaymentSchema } from './payment.sheema';
import { PaymentsService } from './payments.servise';
import { PaymentsController } from './payments.controller';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrialPayment.name, schema: TrialPaymentSchema },
    ]),
    StripeModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
