import { Module } from "@nestjs/common";
import { RavenModule, RavenInterceptor } from "nest-raven";
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
import { APP_INTERCEPTOR } from "@nestjs/core";
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
    InteractionsModule,
    RavenModule
  ],
  providers: [
    MailerService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor()
    },
    {
      provide: ConfigService,
      useValue: new ConfigService()
    }
  ]
})
export class AppModule {}
