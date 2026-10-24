import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "../../auth/auth.module";
import { SupportSessionController } from "./support-session.controller";
import { SupportSessionHistoryController } from "./support-session-history.controller";
import { SupportSessionExpiryCleaner } from "./support-session-expiry-cleaner.service";
import { SupportSessionService } from "./support-session.service";

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [SupportSessionController, SupportSessionHistoryController],
  providers: [SupportSessionService, SupportSessionExpiryCleaner],
  exports: [SupportSessionService],
})
export class SupportSessionModule {}
