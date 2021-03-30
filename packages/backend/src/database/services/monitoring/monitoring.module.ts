import { Module } from "@nestjs/common";
import { MonitoringCleaner } from "./MonitoringCleaner.service";

@Module({
  controllers: [],
  exports: [MonitoringCleaner],
  imports: [],
  providers: [MonitoringCleaner],
})
export class MonitoringModule {}
