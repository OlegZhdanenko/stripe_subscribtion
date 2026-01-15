import { Module } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { PrismaModule } from 'src/prisma/payment.module';

@Module({
  imports: [PrismaModule],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
