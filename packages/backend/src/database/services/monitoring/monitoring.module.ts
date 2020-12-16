import { Module } from "@nestjs/common";
import { DatabaseModule } from "..";
import { MonitoringCleaner } from "./MonitoringCleaner.service";

@Module({
  controllers: [],
  exports: [MonitoringCleaner],
  imports: [
    DatabaseModule,
    // forwardRef(() => UsersModule),
    // forwardRef(() => StructuresModule),
    // forwardRef(() => UsagersModule),
    // forwardRef(() => InteractionsModule),
  ],
  providers: [MonitoringCleaner],
})
export class MonitoringModule {}
