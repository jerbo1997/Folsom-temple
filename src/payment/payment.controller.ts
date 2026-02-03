import { Controller, Post, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('ccavenue/webhook')
  async webhook(@Req() req) {
    console.log('<<< Payload >>>', JSON.stringify(req.body), '<<< Payload >>>');
    console.log('>>>>>', req);
    return {
      message: 'success',
    };
  }
}
