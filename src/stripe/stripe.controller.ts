import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // @Post('create-payment-intent')
  // async createPaymentIntent(@Body() body: StripePaymentDto) {
  //   return this.stripeService.createPaymentIntent(body.amount);
  // }

  // @Post('create-payment-method')
  // async createPaymentMethod() {
  //   return this.stripeService.createPaymentMethod();
  // }

  // @Post('create-customer')
  // async createCustomer() {
  //   return this.stripeService.createCustomer();
  // }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.stripeService.webhook(req, res, signature);

    return { message: 'success' };
  }
}
