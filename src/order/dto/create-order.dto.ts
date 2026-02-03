import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  cartId: string;

  @IsNotEmpty()
  amount: number;

  @IsOptional()
  razorpayOrderId: string;
}

export class CreateInstantOrderDto {
  @ApiProperty({ example: 'clnd1jika0002vjv05vda6sk9' })
  @IsOptional()
  serviceCalendarId: string;

  @ApiProperty({ example: 'clnd1jijj0001vjv01m9gqpbn' })
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ example: 1000 })
  @IsOptional()
  @Min(1, { message: 'amount must be greater than 0' })
  amount: number;

  @ApiProperty({ example: 'specialInstruction' })
  @IsOptional()
  specialInstruction: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsOptional()
  mobile: string;

  @ApiProperty({ example: '+91' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.mobile)
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsIn([true])
  isOfflineOrder: boolean;

  @ApiProperty({ example: 'user1' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: 'Avitam' })
  @IsString()
  @IsOptional()
  star: string;

  @ApiProperty({ example: 'Kumbam' })
  @IsString()
  @IsOptional()
  rasi: string;

  @ApiProperty({ example: 'Vishvamitra' })
  @IsString()
  @IsOptional()
  gothram: string;

  @ApiProperty({ enum: ['QrCode', 'Cheque', 'Cash', 'Upi'] })
  @IsString()
  @IsOptional()
  @IsIn(['QrCode', 'Cheque', 'Cash', 'Upi'])
  mode: string;

  @ApiProperty({ example: '12.2023-10-31T11:10:25.013Z.2022' })
  @IsDateString()
  @IsOptional()
  date: string;

  @ApiProperty({ example: 'asdfg' })
  @IsString()
  @IsOptional()
  value: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  inPerson: boolean;

  @ApiProperty({ example: 'qwertyuiasdfghj567vbnm88' })
  @IsOptional()
  addressId: string;

  @ApiProperty({ example: ['jhftedrxcfytuyuq1'] })
  @IsOptional()
  @IsArray()
  devotees: string[];
}

export class UpdateOrder {
  @IsNotEmpty()
  id: string;

  @IsOptional()
  paymentId: string;

  @IsOptional()
  event: string;

  @IsOptional()
  amount: number;

  @IsOptional()
  paymentMethod: string;
}

export class Order {
  @IsString()
  orderId: string;
}

export class CreateAdminOrder {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ example: 'krish' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+91' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  isOfflineOrder: boolean;

  @ApiProperty({ enum: ['QrCode', 'Check', 'Cash', 'Upi'] })
  @IsString()
  @IsOptional()
  @IsIn(['QrCode', 'Check', 'Cash', 'Upi'])
  mode: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  inPerson: boolean;

  @ApiProperty({ example: 'qwertyuiasdfghj567vbnm88' })
  @IsOptional()
  addressId: string;

  @ApiProperty({ example: 'specialInstruction' })
  @IsOptional()
  specialInstruction: string;

  @ApiProperty({ example: 'qwertyuiasdfghj567vbnm88' })
  @IsOptional()
  paymentMethodId: string;
}
