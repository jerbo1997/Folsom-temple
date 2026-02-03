import { Injectable } from '@nestjs/common';
import { _InitiatePayment } from 'src/utils/types/custom-types';
import * as crypto from 'crypto';
import { CustomResponseException } from 'src/utils/exceptions/custom-response.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CC_AVENUE } from 'src/const';

@Injectable()
export class CcAvenueService {
  constructor(private readonly prisma: PrismaService) {}

  async initiatePayment(order: any) {
    const input: _InitiatePayment = {
      amount: order.amount,
      cancel_url: process.env.CC_AVENUE_REDIRECT_URL,
      currency: CC_AVENUE.CURRENCY,
      language: CC_AVENUE.LANGUAGE,
      merchant_id: process.env.CCAVENUE_MERCHANT_ID,
      order_id: order.orderId,
      redirect_url: process.env.CC_AVENUE_REDIRECT_URL,
      billing_name: order.createdBy.name,
      billing_address: order.address.addressLine1,
      billing_city: order.address.city,
      billing_state: order.address.state,
      billing_zip: order.address.pinCode,
      billing_country: order.address.country,
      billing_tel: order.createdBy.mobile,
      billing_email: order.createdBy.email,
    };
    let data = '';
    for (const [key, entry] of Object.entries(input)) {
      data += `${key}=${entry}&`;
    }
    data = data.slice(0, -1);
    console.log('data>>>', data);
    data = this.newEncrypt(data, process.env.CCAVENUE_WORKING_KEY);
    const formData = `<form id="nonseamless" method="post" name="redirect" action="${process.env.CCAVENUE_URL}"/> <input type="hidden" id="encRequest" name="encRequest" value="${data}"><input type="hidden" name="access_code" id="access_code" value="${process.env.CCAVENUE_ACCESSCODE}"><script language="javascript">document.redirect.submit();</script></form>`;
    throw new CustomResponseException(
      'Sending response as html form',
      formData,
      { 'Content-Type': 'text/html' },
    );
  }

  async webhook(data: any) {
    const result = this.newDecrypt(data, process.env.CCAVENUE_WORKING_KEY);
    console.log('result>>>', result);
    const pairs = result.split('&');
    // Create an object from the key-value pairs
    const response: any = {};
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      response[key] = decodeURIComponent(value || '');
    }
    const order = await this.prisma.order.findUnique({
      where: {
        orderId: response.order_id,
      },
      include: { cart: true },
    });
    if (!order) {
      console.log('Order not found - ', response.order_id);
    }
    const updateData: Prisma.OrderUpdateInput = {};
    if (CC_AVENUE.STATUS.SUCCESS === response.order_status) {
      updateData.orderStatus = response.order_status;
      updateData.payment = {
        create: {
          amount: Number(response.amount),
          paymentId: response.bank_ref_no,
          paymentMethod: response.payment_mode,
          status: response.order_status,
        },
      };
    } else {
      updateData.orderStatus = CC_AVENUE.STATUS.FAILURE;
      updateData.payment = {
        create: {
          amount: Number(response.amount),
          paymentId: response.bank_ref_no,
          paymentMethod: response.payment_mode,
          status: CC_AVENUE.STATUS.FAILURE,
        },
      };
    }
    await this.prisma.order.update({
      where: { orderId: response.order_id },
      data: updateData,
    });
  }

  private getAlgorithm(keyBase64) {
    const key = Buffer.from(keyBase64, 'base64');
    switch (key.length) {
      case 16:
        return 'aes-128-cbc';
      case 32:
        return 'aes-256-cbc';
    }
    throw new Error('Invalid key length: ' + key.length);
  }

  private newEncrypt(data: string, workingKey: string) {
    const md5 = crypto.createHash('md5').update(workingKey).digest();
    const keyBase64 = Buffer.from(md5).toString('base64');
    const ivBase64 = Buffer.from([
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
      0x0c, 0x0d, 0x0e, 0x0f,
    ]).toString('base64');
    const key = Buffer.from(keyBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    const cipher = crypto.createCipheriv(this.getAlgorithm(keyBase64), key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private newDecrypt(encryptedData, workingKey: string) {
    const md5 = crypto.createHash('md5').update(workingKey).digest();
    const keyBase64 = Buffer.from(md5).toString('base64');
    const ivBase64 = Buffer.from([
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
      0x0c, 0x0d, 0x0e, 0x0f,
    ]).toString('base64');
    const key = Buffer.from(keyBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv(
      this.getAlgorithm(keyBase64),
      key,
      iv,
    );
    let decrypted: any = decipher.update(encryptedData.encResp, 'hex');
    decrypted += decipher.final();
    return decrypted;
  }
}
