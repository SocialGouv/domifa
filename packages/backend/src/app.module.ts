import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { RavenInterceptor, RavenModule } from "nest-raven";
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
import { MailerService } from "./users/services/mailer.service";
import { UsersController } from "./users/users.controller";
import { UsersModule } from "./users/users.module";
@Module({
  controllers: [],
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
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor()
    },
    {
      provide: ConfigService,
      useValue: new ConfigService()
    },
    MailerService
  ]
})
export class AppModule {}
