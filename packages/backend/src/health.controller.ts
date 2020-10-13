import { Controller, Get, Logger } from "@nestjs/common";
import {
  DNSHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from "@nestjs/terminus";
import { ConfigService } from "./config/config.service";
import { appLogger } from "./util";

const config = new ConfigService();

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
    const frontUrl = config.get("DOMIFA_FRONTEND_URL");

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
