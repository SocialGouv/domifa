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
    if (domifaConfig().envId === "local" || domifaConfig().envId === "test") {
      return this.health.check([async () => this.version]);
    }

    return this.health.check([
      async () => {
        return this.dnsIndicator
          .pingCheck("portailAdmin", domifaConfig().apps.portailAdminUrl)
          .then((pingData) => {
            return pingData;
          })
          .catch((err) => {
            console.log(err);
            console.warn(
              `[HealthController] portailAdmin health check error for "${
                domifaConfig().apps.portailAdminUrl
              }"`
            );

            throw new Error(
              `[HealthController] [ENV=${
                domifaConfig().envId
              }] frontend health check error for "${
                domifaConfig().apps.portailAdminUrl
              }"`
            );
          });
      },
      async () => {
        return this.dnsIndicator
          .pingCheck("portailUsagers", domifaConfig().apps.portailUsagersUrl)
          .then((pingData) => {
            return pingData;
          })
          .catch((err) => {
            console.log(err);
            console.warn(
              `[HealthController] portailUsagersUrl health check error for "${
                domifaConfig().apps.portailUsagersUrl
              }"`
            );

            throw new Error(
              `[HealthController] [ENV=${
                domifaConfig().envId
              }] frontend health check error for "${
                domifaConfig().apps.portailUsagersUrl
              }"`
            );
          });
      },
      async () => {
        return this.dnsIndicator
          .pingCheck("frontend", domifaConfig().apps.frontendUrl)
          .then((pingData) => {
            return pingData;
          })
          .catch((err) => {
            console.log(err);
            console.warn(
              `[HealthController] frontend health check error for "${
                domifaConfig().apps.frontendUrl
              }"`
            );

            throw new Error(
              `[HealthController] [ENV=${
                domifaConfig().envId
              }] frontend health check error for "${
                domifaConfig().apps.frontendUrl
              }"`
            );
          });
      },
      // Health Check uniquement sur les machines de prod & préprod
      async () => this.version,
    ]);
  }
}
