import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "../../auth/auth.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersController } from "./controllers/users.controller";
import { UsersPublicController } from "./controllers/users.public.controller";
import { MailsModule } from "../mails/mails.module";
import { UsersSupervisorController } from "./controllers/users-supervisor.controller";

@Module({
  controllers: [
    UsersController,
    UsersPublicController,
    UsersSupervisorController,
  ],
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
