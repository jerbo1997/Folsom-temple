import { Test, TestingModule } from '@nestjs/testing';
import { PremiumBookingsService } from './premium-bookings.service';

describe('PremiumBookingsService', () => {
  let service: PremiumBookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PremiumBookingsService],
    }).compile();

    service = module.get<PremiumBookingsService>(PremiumBookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
