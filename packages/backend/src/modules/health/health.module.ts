import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { PostgresHealthIndicator } from "./postgres-health-indicator.service";

@Module({
  imports: [TerminusModule],
  providers: [PostgresHealthIndicator],
  exports: [PostgresHealthIndicator],
})
export class HealthModule {}
