import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
} from "@nestjs/terminus";
import { SkipThrottle } from "@nestjs/throttler";
import { domifaConfig } from "../../config";
import { PostgresHealthIndicator } from "./postgres-health-indicator.service";

@SkipThrottle()
@Controller("healthz")
export class HealthController {
  public version: HealthIndicatorResult = {
    version: {
      info: domifaConfig().version.toString(),
      status: "up",
    },
  };

  constructor(
    private readonly health: HealthCheckService,
    private readonly postgresIndicator: PostgresHealthIndicator
  ) {}

  @Get("")
  @HealthCheck()
  healthCheckBackendAndDb() {
    return this.health.check([
      async () => this.postgresIndicator.isHealthy("postgres"),
      async () => this.version,
    ]);
  }
}
