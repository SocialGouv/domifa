import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { MailsModule } from "../mails/mails.module";
import { CronMailsService } from "../mails/services/cron-mails.service";
import { StructuresModule } from "../structures/structure.module";
import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";



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
  providers: [UsersService, CronMailsService, ...UsersProviders],
})
export class UsersModule {}
