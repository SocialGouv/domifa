import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { AuthController } from "./auth/auth.controller";
import { AuthModule } from "./auth/auth.module";
import { ConfigService } from "./config/config.service";
import { DatabaseModule } from "./database/database.module";
import { InteractionsController } from "./interactions/interactions.controller";
import { InteractionsModule } from "./interactions/interactions.module";
import { StructuresModule } from "./structures/structure.module";
import { StructuresController } from "./structures/structures.controller";
import { ImportController } from "./usagers/controllers/import.controller";
import { UsagersController } from "./usagers/controllers/usagers.controller";
import { UsagersModule } from "./usagers/usagers.module";
import { MailerService } from "./users/mailer.service";
import { UsersController } from "./users/users.controller";
import { UsersModule } from "./users/users.module";

@Module({
  controllers: [
    AuthController,
    UsagersController,
    UsersController,
    InteractionsController,
    StructuresController,
    ImportController
  ],
  exports: [ConfigService],
  imports: [
    DatabaseModule,
    UsagersModule,
    UsersModule,
    AuthModule,
    StructuresModule,
    InteractionsModule
  ],
  providers: [
    MailerService,
    {
      provide: ConfigService,
      useValue: new ConfigService()
    }
  ]
})
export class AppModule {}
