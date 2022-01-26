import { Module } from "@nestjs/common";

import { AppLogsService } from "./app-logs.service";

@Module({
  exports: [AppLogsService],
  providers: [AppLogsService],
})
export class AppLogsModule {}
