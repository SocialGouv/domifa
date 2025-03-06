import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { PostgresHealthIndicator } from "./postgres-health-indicator.service";
import { HealthController } from "./health.controller";

@Module({
  imports: [TerminusModule],
  providers: [PostgresHealthIndicator],
  exports: [PostgresHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
