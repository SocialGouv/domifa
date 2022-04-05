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
      // Health Check uniquement sur les machines de prod & préprod
      async () => {
        return domifaConfig().envId === "prod" ||
          domifaConfig().envId === "preprod"
          ? this.dnsIndicator.pingCheck("frontend", frontUrl).catch((err) => {
              appLogger.warn(
                `[HealthController] frontend health check error for "${frontUrl}"`,
                { sentryBreadcrumb: true }
              );
              throw err;
            })
          : ({ status: "up" } as unknown as HealthIndicatorResult);
      },

      async () => this.version,
    ]);
  }
}
