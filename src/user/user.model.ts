import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Address } from 'src/address/address.model';

export class User {
  @ApiProperty({ example: 'UUID1234567890' })
  id!: string;

  @ApiProperty({ example: '9988776655' })
  mobile?: string;

  @ApiProperty({ example: '+91' })
  countryCode: string;

  @ApiProperty({ example: 'User name' })
  name?: string;

  @ApiProperty({ example: 'Avittam' })
  star?: string;

  @ApiProperty({ example: 'Kumbam' })
  rasi?: string;

  @ApiProperty({ example: 'Vishvamitra' })
  gothram?: string;

  @ApiProperty({ example: 'Male' })
  gender?: string;

  @ApiProperty({ example: '2023-09-23T14:06:09.340Z' })
  dob?: Date;

  @ApiProperty({ example: 'user1@gmail.com' })
  email?: string;

  @ApiProperty({ example: 'image' })
  imageUrl?: any;

  @ApiProperty({ type: [Address] })
  @ValidateNested({ each: true })
  @Type(() => Address)
  address: Address[];

  @Exclude()
  androidFcmToken: string[];

  @Exclude()
  iosFcmToken: string[];

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

export class UpdateUser {
  @ApiProperty({ example: 'UUID1234567890' })
  id!: string;

  @ApiProperty({ example: '9988776655' })
  mobile?: string;

  @ApiProperty({ example: '+91' })
  countryCode: string;

  @ApiProperty({ example: 'User name' })
  name?: string;

  @ApiProperty({ example: 'Avittam' })
  star?: string;

  @ApiProperty({ example: 'Kumbam' })
  rasi?: string;

  @ApiProperty({ example: 'male' })
  gender?: string;

  @ApiProperty({ example: '2023-09-23T14:06:09.340Z' })
  dob?: Date;

  @ApiProperty({ example: 'user1@gmail.com' })
  email?: string;

  @ApiProperty({ example: 'image' })
  imageUrl?: any;

  @ApiProperty({ type: Address })
  @Type(() => Address)
  address: Address;

  @Exclude()
  isActive: boolean;

  @Exclude()
  androidFcmToken: string[];

  @Exclude()
  iosFcmToken: string[];

  @Exclude()
  provider?: string;

  @Exclude()
  signUpMethod: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(data: Partial<UpdateUser>) {
    Object.assign(this, data);
  }
}
export class SyncUser {
  @ApiProperty({ example: 'Qiljrht33987w9jsdofjijsd09fusdolfnsdf' })
  accessToken: string;

  @ApiProperty({ example: false })
  isUserUpdated: boolean;

  @ApiProperty({ type: UpdateUser })
  user: UpdateUser;

  constructor(data: Partial<SyncUser>) {
    Object.assign(this, data);
  }
}

//shouldnt expose this class
export class UserAndRole extends User {
  role: string;
}

export class MyUser {
  @ApiProperty({ type: User })
  @Type(() => User)
  user: User;

  @ApiProperty({ example: 5 })
  cartItemsCount: number;

  constructor(data: Partial<MyUser>) {
    Object.assign(this, data);
  }
}

export class RoleBasedToken {
  role: string;

  includeUserIds?: string[];

  excludeUserIds?: string[];
}

export class TokenUser {
  userId: string;

  tokens: string[];

  role: string;
}
