import { Controller, Get } from "@nestjs/common";
import {
  DNSHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  HealthIndicatorResult,
} from "@nestjs/terminus";
import { domifaConfig } from "../config";
import { appLogger } from "../util";
import { PostgresHealthIndicator } from "./postgres-health-indicator.service";

@Controller("/healthz")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    public mongooseIndicator: MongooseHealthIndicator,
    public dnsIndicator: DNSHealthIndicator,
    public postgresIndicator: PostgresHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    const frontUrl = domifaConfig().apps.frontendUrl;

    const version: HealthIndicatorResult = {
      version: {
        info: "9",
        status: "up",
      },
    };

    return this.health.check([
      async () => this.postgresIndicator.pingCheck("postgres"),
      async () => this.mongooseIndicator.pingCheck("mongo"),
      async () =>
        this.dnsIndicator.pingCheck("frontend", frontUrl).catch((err) => {
          appLogger.warn(
            `[HealthController] frontend health check error for "${frontUrl}"`,
            { sentryBreadcrumb: true }
          );
          throw err;
        }),
      async () => version,
    ]);
  }
}
