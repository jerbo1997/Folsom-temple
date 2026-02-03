import { Test, TestingModule } from '@nestjs/testing';
import { TempleService } from './temple.service';

describe('TempleService', () => {
  let service: TempleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TempleService],
    }).compile();

    service = module.get<TempleService>(TempleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
