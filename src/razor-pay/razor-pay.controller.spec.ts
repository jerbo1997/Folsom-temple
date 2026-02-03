import { Test, TestingModule } from '@nestjs/testing';
import { RazorPayController } from './razor-pay.controller';
import { RazorPayService } from './razor-pay.service';

describe('RazorPayController', () => {
  let controller: RazorPayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RazorPayController],
      providers: [RazorPayService],
    }).compile();

    controller = module.get<RazorPayController>(RazorPayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
