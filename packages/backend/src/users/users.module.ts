import { forwardRef, Module, HttpModule } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";

import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";

import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";
import { CronMailsService } from "../mails/services/cron-mails.service";
import { MailsModule } from "../mails/mails.module";

@Module({
  controllers: [UsersController],
  exports: [UsersService, ...UsersProviders, CronMailsService],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => MailsModule),
    forwardRef(() => StructuresModule),
  ],
  providers: [UsersService, CronMailsService, ConfigService, ...UsersProviders],
})
export class UsersModule {}
