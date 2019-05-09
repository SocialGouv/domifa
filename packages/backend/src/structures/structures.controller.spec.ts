import { Test, TestingModule } from '@nestjs/testing';
import { StructuresController } from './structures.controller';

describe('Stuctures Controller', () => {
  let controller: StructuresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StructuresController],
    }).compile();

    controller = module.get<StructuresController>(StructuresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
