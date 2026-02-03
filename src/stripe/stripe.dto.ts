import { ApiProperty } from '@nestjs/swagger';

export class StripePaymentDto {
  @ApiProperty({ example: 1000 })
  amount: number;
}
