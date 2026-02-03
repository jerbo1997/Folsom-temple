import { Test, TestingModule } from '@nestjs/testing';
import { CcAvenueController } from './cc-avenue.controller';
import { CcAvenueService } from './cc-avenue.service';

describe('CcAvenueController', () => {
  let controller: CcAvenueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CcAvenueController],
      providers: [CcAvenueService],
    }).compile();

    controller = module.get<CcAvenueController>(CcAvenueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
