import { Test, TestingModule } from '@nestjs/testing';
import { RazorPayService } from './razor-pay.service';

describe('RazorPayService', () => {
  let service: RazorPayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RazorPayService],
    }).compile();

    service = module.get<RazorPayService>(RazorPayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
