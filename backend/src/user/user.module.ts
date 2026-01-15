import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaModule } from 'src/prisma/payment.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
