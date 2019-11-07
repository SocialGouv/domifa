import { Injectable } from "@nestjs/common";
import {
  DNSHealthIndicator,
  MongooseHealthIndicator,
  TerminusEndpoint,
  TerminusModuleOptions,
  TerminusOptionsFactory
} from "@nestjs/terminus";

@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory {
  constructor(private readonly mongoose: MongooseHealthIndicator) {}

  public createTerminusOptions(): TerminusModuleOptions {
    const healthEndpoint: TerminusEndpoint = {
      healthIndicators: [
        async () =>
          this.mongoose.pingCheck("mongo", { connection: "resources" })
      ],
      url: "/health"
    };
    return {
      endpoints: [healthEndpoint]
    };
  }
}
