import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import {
  STRIPE_PAYMENT_FAILED,
  STRIPE_PAYMENT_SUCCESS,
  US_CURRENCY,
  WEBHOOK_FAILURE,
  WEBHOOK_SUCCESS,
} from 'src/const';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StripeService {
  constructor(
    @Inject('STRIPE') private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
  ) {}

  async createPaymentIntent(amount: number) {
    const payment = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: US_CURRENCY,
    });
    console.log('>>>>>>>>', payment);
    return payment;
  }

  //   async findAll(){
  //     const account = await this.stripe.accounts.retrieve('acct_1Qw1v44MTQxfcCWQ');
  // console.log(account);
  //   }

  //   async createPaymentMethod() {
  //     const paymentMethod = await this.stripe.paymentMethods.create({
  //       type: 'card',
  //       card: {
  //         token: 'tok_visa',
  //       },
  //     });
  //     console.log('>>>>>>>>',paymentMethod.id,'>>>>>>>>',paymentMethod)
  //     return {result:paymentMethod};
  //   }

  // async createCustomer() {
  //   const customer = await this.stripe.customers.create({
  //     payment_method: 'pm_1QwaKEQIUX9WZoVL8Ws4IX5x',
  // email: 'customer@example.com',
  //   });
  //   console.log('>>>>>>>>',customer.id,'>>>>>>>>',customer)
  //   return customer;
  // }

  async webhook(req: Request, res: Response, signature: string) {
    console.log('webhook sig ?>>>>', typeof signature, signature);
    let event;
    const updateData: any = {};
    try {
      console.log('webhook body ?>>>>', typeof req.body, req.body);
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
      console.log(JSON.stringify(req.body), '<<<<<<<<<< Payload >>>>>>>>>>>>');
      console.log(event, '<<<<<<<<<< Payload >>>>>>>>>>>>');
      switch (event.type) {
        case STRIPE_PAYMENT_SUCCESS:
          updateData.orderStatus = WEBHOOK_SUCCESS;

          console.log('✅ Payment successful:', event.data.object);
          break;
        case STRIPE_PAYMENT_FAILED:
          updateData.orderStatus = WEBHOOK_FAILURE;
          console.log('❌ Payment failed:', event.data.object);
          break;
      }
      const order = await this.prisma.order.findUnique({
        where: {
          orderId: event.data.object.id,
        },
        include: { cart: true },
      });
      if (!order) {
        console.log('order not found stripe webhook api>>>>>');
        return { message: 'success' };
      }
      if (order.paymentId) {
        updateData.payment = {
          update: {
            amount: event.data.object.amount,
            // paymentId: event.data.object.paymentId,
            // paymentMethod: event.data.object.paymentMethod,
            status: String(updateData.orderStatus),
          },
        };
      } else {
        updateData.payment = {
          create: {
            amount: event.data.object.amount,
            // paymentId: event.data.object.paymentId,
            // paymentMethod: event.data.object.paymentMethod,
            status: String(updateData.orderStatus),
          },
        };
      }
      await this.prisma.order.update({
        where: { orderId: event.data.object.id },
        data: updateData,
      });
    } catch (err) {
      console.error('Webhook signature verification failed.', err);
      return { message: 'success' };
    }
  }
}
