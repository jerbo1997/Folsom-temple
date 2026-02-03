import { Test, TestingModule } from '@nestjs/testing';
import { ServiceCalendarController } from './service-calendar.controller';
import { ServiceCalendarService } from './service-calendar.service';

describe('ServiceCalendarController', () => {
  let controller: ServiceCalendarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceCalendarController],
      providers: [ServiceCalendarService],
    }).compile();

    controller = module.get<ServiceCalendarController>(ServiceCalendarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
