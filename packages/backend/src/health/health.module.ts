import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  DNSHealthIndicator,
  MongooseHealthIndicator,
  TerminusModule,
  TerminusModuleOptions,
} from "@nestjs/terminus";
import { domifaConfig } from "../config";
import { buildMongoConnectionStringFromEnv } from "../database/database.providers";

const frontUrl = domifaConfig().apps.frontendUrl;

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
