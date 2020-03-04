import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  DNSHealthIndicator,
  MongooseHealthIndicator,
  TerminusModule,
  TerminusModuleOptions
} from "@nestjs/terminus";

import { ConfigService } from "../config/config.service";

const config = new ConfigService();
const user = config.get("DB_USER");
const password = config.get("DB_PASS");
const host = config.get("DB_HOST");
const port = config.get("DB_PORT");
const frontUrl = config.get("FRONT_URL");

const getTerminusOptions = (
  mongoose: MongooseHealthIndicator,
  dns: DNSHealthIndicator
): TerminusModuleOptions => ({
  endpoints: [
    {
      healthIndicators: [
        async () => mongoose.pingCheck("mongo"),
        async () => dns.pingCheck("frontend", frontUrl)
      ],
      url: "/health"
    }
  ]
});
@Module({
  imports: [
    MongooseModule.forRoot(
      "mongodb://" + user + ":" + password + "@" + host + ":" + port + "/domifa"
    ),
    TerminusModule.forRootAsync({
      inject: [MongooseHealthIndicator, DNSHealthIndicator],
      useFactory: getTerminusOptions
    })
  ]
})
export class HealthModule {}
