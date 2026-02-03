import { Test, TestingModule } from '@nestjs/testing';
import { CcAvenueService } from './cc-avenue.service';

describe('CcAvenueService', () => {
  let service: CcAvenueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CcAvenueService],
    }).compile();

    service = module.get<CcAvenueService>(CcAvenueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
