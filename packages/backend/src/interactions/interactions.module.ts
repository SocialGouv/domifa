import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsagersModule } from '../usagers/usagers.module';
import { UsersModule } from '../users/users.module';
import { InteractionsController } from './interactions.controller';
import { InteractionsProviders } from './interactions.providers';
import { InteractionsService } from './interactions.service';


@Module({
  controllers: [ InteractionsController ],
  exports: [ InteractionsService ],
  imports: [ DatabaseModule, UsersModule, UsagersModule ],
  providers: [ InteractionsService, ...InteractionsProviders ],
})


export class InteractionsModule {}
