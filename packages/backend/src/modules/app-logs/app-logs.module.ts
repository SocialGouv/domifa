import { Module } from "@nestjs/common";

import { AppLogsService } from "./app-logs.service";
import { AppLogSecurityService } from "./app-log-security.service";

@Module({
  exports: [AppLogsService, AppLogSecurityService],
  providers: [AppLogsService, AppLogSecurityService],
})
export class AppLogsModule {}
