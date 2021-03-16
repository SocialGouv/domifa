import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database";
import { MailsModule } from "../mails/mails.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";

@Module({
  controllers: [UsersController],
  exports: [...UsersProviders],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => MailsModule),
    forwardRef(() => StructuresModule),
  ],
  providers: [...UsersProviders],
})
export class UsersModule {}
