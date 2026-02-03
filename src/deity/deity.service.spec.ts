import { Test, TestingModule } from '@nestjs/testing';
import { DeityService } from './deity.service';

describe('DeityService', () => {
  let service: DeityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeityService],
    }).compile();

    service = module.get<DeityService>(DeityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
