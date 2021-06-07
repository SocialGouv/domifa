import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
} from "@nestjs/terminus";
import { domifaConfig } from "../config";
import { appLogger } from "../util";
import { PostgresHealthIndicator } from "./postgres-health-indicator.service";

@Controller("/healthz")
export class HealthController {
  version: HealthIndicatorResult = {
    version: {
      info: domifaConfig().version,
      status: "up",
    },
  };

  constructor(
    private health: HealthCheckService,
    public dnsIndicator: HttpHealthIndicator,
    public postgresIndicator: PostgresHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheckBackendAndDb() {
    return this.health.check([
      async () => this.postgresIndicator.pingCheck("postgres"),
      async () => this.version,
    ]);
  }

  @Get("full")
  @HealthCheck()
  healthCheckFull() {
    const frontUrl = domifaConfig().healthz.frontendUrlFromBackend;
    return this.health.check([
      async () => this.postgresIndicator.pingCheck("postgres"),
      async () =>
        this.dnsIndicator.pingCheck("frontend", frontUrl).catch((err) => {
          appLogger.warn(
            `[HealthController] frontend health check error for "${frontUrl}"`,
            { sentryBreadcrumb: true }
          );
          throw err;
        }),
      async () => this.version,
    ]);
  }
}
