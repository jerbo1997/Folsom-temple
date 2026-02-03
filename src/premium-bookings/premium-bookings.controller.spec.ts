import { Test, TestingModule } from '@nestjs/testing';
import { PremiumBookingsController } from './premium-bookings.controller';
import { PremiumBookingsService } from './premium-bookings.service';

describe('PremiumBookingsController', () => {
  let controller: PremiumBookingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PremiumBookingsController],
      providers: [PremiumBookingsService],
    }).compile();

    controller = module.get<PremiumBookingsController>(PremiumBookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
