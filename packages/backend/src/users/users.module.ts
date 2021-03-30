import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MailsModule } from "../mails/mails.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersController } from "./users.controller";

@Module({
  controllers: [UsersController],
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
