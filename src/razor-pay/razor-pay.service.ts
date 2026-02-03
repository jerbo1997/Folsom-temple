import { Injectable } from '@nestjs/common';
import Razorpay = require('razorpay');
import { CurrencyCode, Receipt } from 'src/const';
import { Order } from 'src/order/dto/create-order.dto';

@Injectable()
export class RazorPayService {
  private readonly razorpay: Razorpay;
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(amount: number) {
    const totalAmount = amount * 100;
    const total = totalAmount;
    const orderDetails = {
      amount: total,
      currency: CurrencyCode,
      receipt: Receipt,
    };
    const razorpayOrder = await this.razorpay.orders.create(orderDetails);
    const order: Order = {
      orderId: razorpayOrder.id,
    };
    return order as Order;
  }

}