import { Controller, Get } from "@nestjs/common";
import {
  HealthCheckService,
  MongooseHealthIndicator,
  DNSHealthIndicator,
  HealthCheck,
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

    return this.health.check([
      async () => this.mongoose.pingCheck("mongo"),
      async () => this.dns.pingCheck("frontend", frontUrl),
    ]);
  }
}
