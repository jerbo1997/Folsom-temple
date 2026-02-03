import { Test, TestingModule } from '@nestjs/testing';
import { DeityController } from './deity.controller';
import { DeityService } from './deity.service';

describe('DeityController', () => {
  let controller: DeityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeityController],
      providers: [DeityService],
    }).compile();

    controller = module.get<DeityController>(DeityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
