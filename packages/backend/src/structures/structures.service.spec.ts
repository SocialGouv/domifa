import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { UsersController } from '../users/users.controller';
import { StructuresProviders } from './structures-providers';
import { StructuresService } from './structures.service';

describe('Structure Service', () => {
  let service: StructuresService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ DatabaseModule ],
      providers: [ StructuresService, ...StructuresProviders ],
    }).compile();
    service = module.get<StructuresService>(StructuresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
