import { Test, TestingModule } from '@nestjs/testing';
import { CronConfigController } from './cron-config.controller';
import { CronConfigService } from './cron-config.service';

describe('CronConfigController', () => {
  let controller: CronConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronConfigController],
      providers: [CronConfigService],
    }).compile();

    controller = module.get<CronConfigController>(CronConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
