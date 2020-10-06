import { Controller, Get, Logger } from "@nestjs/common";
import {
  DNSHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from "@nestjs/terminus";
import { ConfigService } from "./config/config.service";

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

    // Logger.warn(`Healthcheck frontend configuration: "${frontUrl}"`);

    return this.health.check([
      async () => this.mongoose.pingCheck("mongo"),
      async () =>
        this.dns.pingCheck("frontend", frontUrl).catch((err) => {
          Logger.error(
            `[HealthController] frontend health check error for "${frontUrl}"`,
            err
          );
          throw err;
        }),
    ]);
  }
}
