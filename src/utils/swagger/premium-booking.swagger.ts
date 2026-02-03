import { ApiProperty } from '@nestjs/swagger';
import { PremiumBookings } from 'src/premium-bookings/premium-bookings.model';

export class PremiumBookingsSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'premiumBookings Fetched successfully' })
  message: string;

  @ApiProperty({ type: PremiumBookings })
  result: PremiumBookings;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}
