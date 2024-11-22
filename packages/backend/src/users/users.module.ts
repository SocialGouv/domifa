import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersController } from "./controllers/users.controller";
import { UsersPublicController } from "./controllers/users.public.controller";
import { MailsModule } from "../modules/mails/mails.module";

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
