import { Module } from "@nestjs/common";
import { AuthController } from "./auth/auth.controller";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { InteractionsController } from "./interactions/interactions.controller";
import { InteractionsModule } from "./interactions/interactions.module";
import { StructuresModule } from "./structures/structure.module";
import { StructuresController } from "./structures/structures.controller";
import { UsagersController } from "./usagers/usagers.controller";
import { UsagersModule } from "./usagers/usagers.module";
import { UsersController } from "./users/users.controller";
import { UsersModule } from "./users/users.module";

@Module({
  controllers: [
    AuthController,
    UsagersController,
    UsersController,
    InteractionsController,
    StructuresController
  ],
  imports: [
    DatabaseModule,
    UsagersModule,
    UsersModule,
    AuthModule,
    StructuresModule,
    InteractionsModule
  ]
})
export class AppModule {}
