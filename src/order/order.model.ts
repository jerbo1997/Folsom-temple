import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { Address } from 'src/address/address.model';
import { Cart } from 'src/cart/cart.model';

export class CreateOrder {
  constructor(data: Partial<CreateOrder>) {
    Object.assign(this, data);
  }
  @ApiProperty({ example: 'cln4f19t60002qwfjx4flb8nk' })
  id: string;

  @ApiProperty({ example: 750 })
  amount: number;

  @ApiProperty({ example: 'order_MiRjH2OCsXxNwt' })
  orderId: string;

  @ApiProperty({ example: 'O-29092023-1000' })
  orderNo: string;

  @ApiProperty({ example: 'Success' })
  orderStatus: string;

  @ApiProperty({ example: 'cln5ngla40000ursw0nfh8o2n' })
  paymentId: string;

  @ApiProperty({ example: 'Cash or Upi' })
  paymentMethod: string;

  @ApiProperty({ example: 'Online or Offline' })
  mode: string;

  @ApiProperty({ example: 'specialInstruction' })
  specialInstruction: string;

  @ApiProperty({ example: true })
  inPersonVisit: boolean;

  @ApiProperty({ type: Address })
  address: Address;

  @ApiProperty({ type: Cart })
  @Type(() => Cart)
  cart: Cart;

  @ApiProperty({ example: '{"date":"2024-01-26T00:00:00.000Z","value":"12"}' })
  additionalInfo: string;

  @Exclude()
  cartId: string;

  @Exclude()
  createdById: string;

  @Exclude()
  createdForId: string;

  @Exclude()
  isActive: string;

  @ApiProperty({ example: '2023-10-02T03:12:35.988Z' })
  createdAt: Date;

  @ApiProperty({ example: 'http://someorg.co.in/webhook' })
  redirectUrl: string;

  @Exclude()
  updatedAt: Date;
}

export class OrdersCount {
  constructor(data: Partial<OrdersCount>) {
    Object.assign(this, data);
  }
  @ApiProperty({ example: 12 })
  ordersCount: number;
}

export class getAllOrdersCount {
  constructor(data: Partial<getAllOrdersCount>) {
    Object.assign(this, data);
  }
  @ApiProperty({ example: 12 })
  bookingsCount: number;

  @ApiProperty({ example: 12 })
  orderSuccessCount: number;

  @ApiProperty({ example: 12 })
  orderFailureCount: number;

  @ApiProperty({ example: 12 })
  donationSuccessCount: number;

  @ApiProperty({ example: 12 })
  donationFailureCount: number;
}
