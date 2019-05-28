import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { UsagersModule } from '../usagers/usagers.module';
import { UsersModule } from '../users/users.module';
import { InteractionsController } from './interactions.controller';
import { InteractionsProviders } from './interactions.providers';
import { InteractionsService } from './interactions.service';

describe('Interactions Controller', () => {
  let controller: InteractionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteractionsController],
      imports: [ DatabaseModule, UsersModule, UsagersModule ],
      providers: [ InteractionsService, ...InteractionsProviders ],

    }).compile();

    controller = module.get<InteractionsController>(InteractionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
