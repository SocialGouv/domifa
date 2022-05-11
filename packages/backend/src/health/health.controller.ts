import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
} from "@nestjs/terminus";
import { domifaConfig } from "../config";

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
    const frontUrl =
      domifaConfig().envId === "local"
        ? "127.0.0.1:4200"
        : domifaConfig().apps.frontendUrl;

    return this.health.check([
      async () => {
        return domifaConfig().envId !== "local" &&
          domifaConfig().envId !== "test"
          ? this.dnsIndicator
              .pingCheck("frontend", frontUrl)
              .then((pingData) => {
                console.log("[HealthController] frontend up - " + frontUrl);
                return pingData;
              })
              .catch((err) => {
                console.log(err);
                console.warn(
                  `[HealthController] frontend health check error for "${frontUrl}"`,
                  { sentryBreadcrumb: true }
                );
                console.log(err);
                throw new Error(
                  `[HealthController] [ENV=${
                    domifaConfig().envId
                  }] frontend health check error for "${frontUrl}"`
                );
              })
          : { frontend: { status: "up" } };
      },
      // Health Check uniquement sur les machines de prod & préprod
      async () => this.version,
    ]);
  }
}
