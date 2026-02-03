import { Module } from '@nestjs/common';
import { RazorPayService } from './razor-pay.service';
import { RazorPayController } from './razor-pay.controller';

@Module({
  controllers: [RazorPayController],
  providers: [RazorPayService],
})
export class RazorPayModule { }
