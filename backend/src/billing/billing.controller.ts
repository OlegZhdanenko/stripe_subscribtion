import {
  Controller,
  Post,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Post('subscribe')
  async start(@Req() req) {
    try {
      if (!req.user?.id || !req.user?.email) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.billing.startTrial(req.user.id, req.user.email);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to start trial',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
