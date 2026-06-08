import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "../../auth/auth.module";
import { StructuresModule } from "../structures/structure.module";
import { UsersController } from "./controllers/users.controller";
import { UsersPublicController } from "./controllers/users.public.controller";
import { MailsModule } from "../mails/mails.module";
import { OtpModule } from "../otp/otp.module";
import { UsersSupervisorController } from "./controllers/users-supervisor.controller";
import { AppLogsService } from "../app-logs/app-logs.service";
import { ExpiredTemporaryBlockCleaner } from "./services/crons/expired-temporary-block-cleaner.service";
import { ExpiredTokenCleaner } from "./services/crons/expired-token-cleaner.service";
import { UserStructureDecisionService } from "./services/user-structure-decision/user-structure-decision.service";

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
    forwardRef(() => OtpModule),
  ],
  providers: [
    AppLogsService,
    ExpiredTemporaryBlockCleaner,
    ExpiredTokenCleaner,
    UserStructureDecisionService,
  ],
})
export class UsersModule {}
