import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ServiceCalendars } from 'src/service-calendar/service-calendar.model';
import { User } from 'src/user/user.model';

export class Devotees {
  constructor(data: Partial<Devotees>) {
    Object.assign(this, data);
  }
  @ApiProperty({ example: 'UUID1234567890' })
  id: string;

  @ApiProperty({ example: 'me' })
  name: string;

  @ApiProperty({ example: 'adsd' })
  rasi: string;

  @ApiProperty({ example: 'adsda' })
  star: string;
}
export class CartItem {
  constructor(data: Partial<CartItem>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'UUID1234567890' })
  id: string;

  @ApiProperty({ enum: [1, 0, -1] })
  quantity: number;

  @ApiProperty({ example: 100 })
  price: number;

  @ApiProperty({ example: 100 })
  amount: number;

  @ApiProperty({ type: ServiceCalendars })
  @ValidateNested()
  @Type(() => ServiceCalendars)
  service: ServiceCalendars;

  @Exclude()
  @ApiProperty({ example: 'UUID1234567890' })
  cartId: String;

  @ApiProperty({ type: [Devotees] })
  @Type(() => Devotees)
  devotees: Devotees[];

  @Exclude()
  serviceId: String;

  @Exclude()
  serviceCalendarId: String;

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;
}
export class Cart {
  @ApiProperty({ example: 'UUID1234567890' })
  id: string;

  @ApiProperty({ example: 625 })
  amount?: number;

  @ApiProperty({ example: false })
  checkout: boolean;

  @Exclude()
  templeId: string;

  @ApiProperty({ example: 625 })
  totalItemsQty?: number;

  @ApiProperty({ type: [CartItem] })
  @ValidateNested({ each: true })
  @Type(() => CartItem)
  cartItems?: CartItem[];

  @ApiProperty({ example: 'any' })
  specialInstruction: string;

  @Exclude()
  user: User;

  @Exclude()
  userId: User;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  isActive: boolean;

  constructor(data: Partial<Cart>) {
    Object.assign(this, data);
  }
}
