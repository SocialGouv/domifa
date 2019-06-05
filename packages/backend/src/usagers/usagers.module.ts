import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { CerfaService } from './services/cerfa.service';
import { UsagersService } from './services/usagers.service';
import { UsagersController } from './usagers.controller';
import { UsagersProviders } from './usagers.providers';

@Module({
  controllers: [ UsagersController ],
  exports: [ UsagersService, CerfaService],
  imports: [ DatabaseModule, UsersModule ],
  providers: [ UsagersService, CerfaService, ...UsagersProviders ],
})

export class UsagersModule {

}
