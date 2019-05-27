import { Module} from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { InteractionsController } from './interactions/interactions.controller';
import { InteractionsModule } from './interactions/interactions.module';
import { InteractionsService } from './interactions/interactions.service';
import { StructuresModule } from './structures/structure.module';
import { StructuresController } from './structures/structures.controller';
import { UsagersController } from './usagers/usagers.controller';
import { UsagersModule } from './usagers/usagers.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';


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
  providers: [ ]
})
export class AppModule {}
