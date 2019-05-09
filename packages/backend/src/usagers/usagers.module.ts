import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { StructuresProviders } from '../structures/structures-providers';
import { StructuresService } from '../structures/structures.service';
import { UsersService } from '../users/users.service';
import { CerfaService } from './services/cerfa.service';
import { UsagersService } from './services/usagers.service';
import { UsagersController } from './usagers.controller';
import { UsagersProviders } from './usagers.providers';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [ UsagersController ],
  exports: [ UsagersService, CerfaService ],
  imports: [ DatabaseModule, UsersModule ],
  providers: [ UsagersService, CerfaService, ...UsagersProviders ],
})

export class UsagersModule {

}
