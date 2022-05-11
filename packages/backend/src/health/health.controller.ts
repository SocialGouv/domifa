import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
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
    public postgresIndicator: PostgresHealthIndicator,
    private db: TypeOrmHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheckBackendAndDb() {
    return this.health.check([
      async () => this.db.pingCheck(domifaConfig().postgres.database),
      async () => this.postgresIndicator.pingCheck("postgres"),
      async () => this.version,
    ]);
  }

  @Get("full")
  @HealthCheck()
  healthCheckFull() {
    const frontUrl = domifaConfig().apps.frontendUrl;
    return this.health.check([
      async () => {
        return this.dnsIndicator
          .pingCheck("frontend", frontUrl)
          .then((pingData) => {
            console.log(pingData);
            return pingData;
          })
          .catch((err) => {
            appLogger.warn(
              `[HealthController] frontend health check error for "${frontUrl}"`,
              { sentryBreadcrumb: true }
            );
            appLogger.error(err);
            throw new Error(
              `[HealthController] [ENV=${
                domifaConfig().envId
              }] frontend health check error for "${frontUrl}"`
            );
          });
      },
      async () => this.db.pingCheck(domifaConfig().postgres.database),
      // Health Check uniquement sur les machines de prod & préprod
      async () => this.version,
    ]);
  }
}
