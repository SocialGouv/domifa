import { Module } from "@nestjs/common";

import { LogsService } from "./app-log.service";

@Module({
  exports: [LogsService],
  providers: [LogsService],
})
export class LogsModule {}
