import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class Address {
  @ApiProperty({ example: 'uui9384792387492374d1' })
  id: string;

  @ApiProperty({ example: ' 12-B, Appaswamy apartment, sholingnallur, Chennai' })
  addressLine1: string;

  @ApiProperty({ example: '1A, blue moon apartment, sholingnallur, Chennai' })
  addressLine2: string;

  @ApiProperty({ example: 'user  name' })
  name: string;

  @ApiProperty({ example: '1234567890' })
  mobile: string;

  @ApiProperty({ example: 'Sipcot' })
  landmark: string;

  @ApiProperty({ example: '600116' })
  pinCode: string;

  @ApiProperty({ example: 'Chennai' })
  city: string;

  @ApiProperty({ example: 'Tamilnadu' })
  state: string;

  @ApiProperty({ example: 'India' })
  country: string;

  @ApiProperty({ example: 'Home' })
  type: string;

  @ApiProperty({ example: 'Mom' })
  tag: string;

  @Exclude()
  isActive: boolean;

  @Exclude()
  userId: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(data: Partial<Address>) {
    Object.assign(this, data);
  }
}
