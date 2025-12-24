import { Controller, Post, Req } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Post('subscribe')
  start(@Req() req) {
    return this.billing.startTrial(req.user.id, req.user.email);
  }
}
