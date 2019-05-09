import { Test, TestingModule } from '@nestjs/testing';
import { UsagersController } from './usagers.controller';

describe('Usagers Controller', () => {
  let controller: UsagersController;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsagersController],
    }).compile();
    
    controller = module.get<UsagersController>(UsagersController);
  });
  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
