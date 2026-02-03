import { Test, TestingModule } from '@nestjs/testing';
import { NewsLetterService } from './news-letter.service';

describe('NewsLetterService', () => {
  let service: NewsLetterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsLetterService],
    }).compile();

    service = module.get<NewsLetterService>(NewsLetterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
