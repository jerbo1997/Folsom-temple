import { Test, TestingModule } from '@nestjs/testing';
import { TempleController } from './temple.controller';
import { TempleService } from './temple.service';

describe('TempleController', () => {
  let controller: TempleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TempleController],
      providers: [TempleService],
    }).compile();

    controller = module.get<TempleController>(TempleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
