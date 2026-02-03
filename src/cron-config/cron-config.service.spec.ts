import { Test, TestingModule } from '@nestjs/testing';
import { CronConfigService } from './cron-config.service';

describe('CronConfigService', () => {
  let service: CronConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronConfigService],
    }).compile();

    service = module.get<CronConfigService>(CronConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
