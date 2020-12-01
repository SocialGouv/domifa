import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database";
import { MailsModule } from "../mails/mails.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";

@Module({
  controllers: [UsersController],
  exports: [UsersService, ...UsersProviders],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => MailsModule),
    forwardRef(() => StructuresModule),
  ],
  providers: [UsersService, ...UsersProviders],
})
export class UsersModule {}
