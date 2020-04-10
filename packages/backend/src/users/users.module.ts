import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";

import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";

import { MailJetService } from "./services/mailjet.service";

import { UsagersModule } from "../usagers/usagers.module";
import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";
import { TipimailService } from "./services/tipimail.service";

@Module({
  controllers: [UsersController],
  exports: [UsersService, ...UsersProviders, MailJetService, TipimailService],
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    forwardRef(() => StructuresModule),
  ],
  providers: [
    UsersService,
    ...UsersProviders,
    MailJetService,
    TipimailService,
    ConfigService,
  ],
})
export class UsersModule {}
