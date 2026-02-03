import { Module } from '@nestjs/common';
import { PremiumBookingsService } from './premium-bookings.service';
import { PremiumBookingsController } from './premium-bookings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PremiumBookingsController],
  providers: [PremiumBookingsService],
})
export class PremiumBookingsModule {}
