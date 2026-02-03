import { PartialType } from '@nestjs/swagger';
import { CreatePremiumBookingDto } from './create-premium-booking.dto';

export class UpdatePremiumBookingDto extends PartialType(CreatePremiumBookingDto) {}
