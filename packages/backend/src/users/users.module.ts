import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";

import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";

import { MailerService } from "./services/mailer.service";

import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";

@Module({
  controllers: [UsersController],
  exports: [UsersService, ...UsersProviders, MailerService],
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    forwardRef(() => StructuresModule)
  ],
  providers: [UsersService, ...UsersProviders, MailerService, ConfigService]
})
export class UsersModule {}
