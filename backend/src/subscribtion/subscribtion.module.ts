import { Module } from '@nestjs/common';

import { SubscriptionsService } from './subscribtion.service';
import { PaymentsModule } from 'src/payment/payment.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { PrismaModule } from 'src/prisma/payment.module';
import { SubscriptionsController } from './subscribtion.controller';

@Module({
  imports: [PrismaModule, StripeModule, PaymentsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
