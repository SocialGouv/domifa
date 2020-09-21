import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  DNSHealthIndicator,
  MongooseHealthIndicator,
  TerminusModule,
  TerminusModuleOptions,
} from "@nestjs/terminus";
import { ConfigService } from "../config/config.service";
import { buildMongoConnectionStringFromEnv } from "../database/database.providers";

const config = new ConfigService();
const frontUrl = config.get("FRONT_URL");

const mongoConnectionString = buildMongoConnectionStringFromEnv();

const getTerminusOptions = (
  mongoose: MongooseHealthIndicator,
  dns: DNSHealthIndicator
): TerminusModuleOptions => ({
  endpoints: [
    {
      healthIndicators: [
        async () => mongoose.pingCheck("mongo"),
        async () => dns.pingCheck("frontend", frontUrl),
      ],
      url: "/",
    },
  ],
});

@Module({
  imports: [MongooseModule.forRoot(mongoConnectionString), TerminusModule],
})
export class HealthModule {}
