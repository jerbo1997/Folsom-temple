import { Test, TestingModule } from '@nestjs/testing';
import { ServiceCalendarService } from './service-calendar.service';

describe('ServiceCalendarService', () => {
  let service: ServiceCalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceCalendarService],
    }).compile();

    service = module.get<ServiceCalendarService>(ServiceCalendarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
