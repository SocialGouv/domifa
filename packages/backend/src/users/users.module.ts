import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MailsModule } from "../mails/mails.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersController } from "./users.controller";
import { UsersPublicController } from "./users.public.controller";

@Module({
  controllers: [UsersController, UsersPublicController],
  exports: [],
  imports: [
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => MailsModule),
    forwardRef(() => StructuresModule),
  ],
  providers: [],
})
export class UsersModule {}
