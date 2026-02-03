import { Test, TestingModule } from '@nestjs/testing';
import { NewsLetterController } from './news-letter.controller';
import { NewsLetterService } from './news-letter.service';

describe('NewsLetterController', () => {
  let controller: NewsLetterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsLetterController],
      providers: [NewsLetterService],
    }).compile();

    controller = module.get<NewsLetterController>(NewsLetterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
