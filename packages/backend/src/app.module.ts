import { Module} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from "@nestjs/mongoose";
import { InteractionsController } from './interactions/interactions.controller';
import { InteractionsModule } from './interactions/interactions.module';
import { InteractionsProviders } from './interactions/interactions.providers';
import { StructuresModule } from './structures/structure.module';
import { StructuresProviders } from './structures/structures-providers';
import { StructuresController } from './structures/structures.controller';
import { UsagersController } from './usagers/usagers.controller';
import { UsagersModule } from './usagers/usagers.module';
import { UsagersProviders } from './usagers/usagers.providers';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersProviders } from './users/users.providers';

@Module({
  controllers: [
    UsagersController,
    UsersController,
    InteractionsController,
    StructuresController,
  ],
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/domifa'),
    UsagersModule,
    UsersModule,
    StructuresModule,
    InteractionsModule,
  ],
  providers: []
})
export class AppModule {}
