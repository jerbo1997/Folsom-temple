import { ApiProperty } from '@nestjs/swagger';
import { CreateOrder, OrdersCount } from 'src/order/order.model';

export class CreateOrderSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Order Created successfully' })
  message: string;

  @ApiProperty({ type: CreateOrder })
  result: CreateOrder;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class FetcheOrderCountSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Orders count Fetched successfully' })
  message: string;

  @ApiProperty({ type: OrdersCount })
  result: OrdersCount;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class FetcheOrderSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Orders Fetched successfully' })
  message: string;

  @ApiProperty({ type: CreateOrder })
  result: CreateOrder;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}
