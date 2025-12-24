import { Module } from '@nestjs/common';
import { UsersModule } from 'src/user/user.module';
import { SubscriptionsService } from './subscribtion.service';

@Module({
  imports: [UsersModule],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
