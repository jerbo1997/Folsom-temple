import { Test, TestingModule } from '@nestjs/testing';
import { TimingController } from './timing.controller';
import { TimingService } from './timing.service';

describe('TimingController', () => {
  let controller: TimingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimingController],
      providers: [TimingService],
    }).compile();

    controller = module.get<TimingController>(TimingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
