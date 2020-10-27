import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  DNSHealthIndicator,
  MongooseHealthIndicator,
  TerminusModule,
  TerminusModuleOptions,
} from "@nestjs/terminus";
import { configService } from "../config/config.service";
import { buildMongoConnectionStringFromEnv } from "../database/database.providers";

const frontUrl = configService.get("DOMIFA_FRONTEND_URL");

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
