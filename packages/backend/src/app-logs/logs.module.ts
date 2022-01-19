import { Module } from "@nestjs/common";

import { LogsService } from "./logs.service";

@Module({
  exports: [LogsService],
  providers: [LogsService],
})
export class LogsModule {}
