import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Address } from 'src/address/address.model';
import { User } from 'src/user/user.model';

export class PremiumBookings {
  constructor(data: Partial<PremiumBookings>) {
    Object.assign(this, data);
  }
  @ApiProperty({ example: 'uui9384792387492374d1' })
  id: string;

  @ApiProperty({})
  @ApiProperty({ example: 1 })
  registrationNo: number;

  @ApiProperty({ type: User })
  @Type(() => User)
  user: User;

  @ApiProperty({ type: Address })
  @Type(() => Address)
  address: Address;

  @ApiProperty({ example: '2024-01-26T00:00:00.000Z' })
  bookingDate: Date;

  @ApiProperty({ example: '12' })
  rptNo: number;

  @ApiProperty({ example: '1200' })
  amount: number;

  @ApiProperty({ example: 'Birthday' })
  occasion: string;

  @ApiProperty({ example: 'Ganesh' })
  deityName: string;
}
