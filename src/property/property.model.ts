import { ApiProperty } from '@nestjs/swagger';
import { RentalStatus } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { Address } from 'src/address/address.model';
import { Attachment } from 'src/attachment.model';
import { User } from 'src/user/user.model';

export enum RentalStatusEnum {
  AVAILABLE = 'AVAILABLE',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  RENTED_OUT = 'RENTED_OUT',
  RETURNED = 'RETURNED',
}

export class PropertyUser {
  @ApiProperty({ example: 'UUID1234567890' })
  id!: string;

  @ApiProperty({ example: '9988776655' })
  mobile?: string;

  @ApiProperty({ example: '+91' })
  countryCode: string;

  @ApiProperty({ example: 'User name' })
  name?: string;

  @ApiProperty({ example: 'Vishvamitra' })
  gothram?: string;

  @ApiProperty({ example: 'user1@gmail.com' })
  email?: string;

  @Exclude()
  androidFcmToken: string[];

  @Exclude()
  iosFcmToken: string[];

  @Exclude()
  gender?: string;

  @Exclude()
  dob?: Date;

  @Exclude()
  imageUrl?: any;

  @Exclude()
  star?: string;

  @Exclude()
  rasi?: string;

  @Exclude()
  isActive: boolean;

  @Exclude()
  rolesId: string;

  @Exclude()
  signUpMethod: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}

export class RentalInfo {
  constructor(data: Partial<RentalInfo>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'f99b1ed0-1e17-4ce7-9f17-2483603c004e' })
  id: string;

  @ApiProperty({ example: 'property name' })
  name: string;

  @ApiProperty({ example: '1234567890' })
  phoneNumber: string;

  @ApiProperty({ type: Address, required: false })
  @Type(() => Address)
  address: Address;

  @ApiProperty({ example: 2, required: false })
  noOfDays: number;

  @ApiProperty({ example: 1200, required: false })
  fees: number;

  @ApiProperty({ type: PropertyUser })
  @Type(() => PropertyUser)
  createdBy: PropertyUser;

  @ApiProperty({ example: '2022-09-27T18:00:00.000Z', required: false })
  startDate: string;

  @ApiProperty({ example: '2022-09-27T18:00:00.000Z', required: false })
  endDate: string;

  @ApiProperty({ example: 'remarks', required: false })
  remarks: string;

  @ApiProperty({ example: '2022-09-27T18:00:00.000Z' })
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  createdById: string;

  @Exclude()
  addressId: string;

  @Exclude()
  rentalPropertyId: string;

  @Exclude()
  templeId: string;
}

export class Property {
  constructor(data: Partial<Property>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'f99b1ed0-1e17-4ce7-9f17-2483603c004e' })
  id: string;

  @ApiProperty({ example: 'property name' })
  name: string;

  @ApiProperty({ example: 'asset type', required: false })
  fees: number;

  @ApiProperty({ type: [Attachment] })
  @Type(() => Attachment)
  image: Attachment;

  @ApiProperty({ type: Address })
  @Type(() => Address)
  address: Address;

  @ApiProperty({ enum: RentalStatus })
  status: RentalStatus;

  @ApiProperty({ type: [RentalInfo] })
  @Type(() => RentalInfo)
  rentals: RentalInfo[];

  @ApiProperty({ type: PropertyUser })
  @Type(() => PropertyUser)
  createdBy: PropertyUser;

  @ApiProperty({ example: '2022-09-27T18:00:00.000Z' })
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  createdById: string;

  @Exclude()
  addressId: string;

  @Exclude()
  templeId: string;

  @Exclude()
  isActive: boolean;
}
