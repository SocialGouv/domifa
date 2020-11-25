import { Controller, Get } from "@nestjs/common";
import {
  DNSHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from "@nestjs/terminus";
import { domifaConfig } from "./config";
import { appLogger } from "./util";

@Controller("")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    public mongoose: MongooseHealthIndicator,
    public dns: DNSHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    const frontUrl = domifaConfig().apps.frontendUrl;

    return this.health.check([
      async () => this.mongoose.pingCheck("mongo"),
      async () =>
        this.dns.pingCheck("frontend", frontUrl).catch((err) => {
          appLogger.warn(
            `[HealthController] frontend health check error for "${frontUrl}"`,
            { sentryBreadcrumb: true }
          );
          throw err;
        }),
    ]);
  }
}
