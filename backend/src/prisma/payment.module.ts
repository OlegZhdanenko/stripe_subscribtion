import { Module } from '@nestjs/common';
import { PaymentsService } from './payment.service';

@Module({
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
