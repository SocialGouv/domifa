import { Injectable } from "@nestjs/common";
import {
  DiskHealthIndicator,
  DNSHealthIndicator,
  MongooseHealthIndicator,
  TerminusEndpoint,
  TerminusModuleOptions,
  TerminusOptionsFactory
} from "@nestjs/terminus";

import * as checkDiskSpace from "check-disk-space";

@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory {
  constructor(
    private readonly dns: DNSHealthIndicator,
    private readonly diskHealthIndicator: DiskHealthIndicator,
    private readonly db: MongooseHealthIndicator
  ) {}

  public async createTerminusOptions(): Promise<TerminusModuleOptions> {
    const { free } = await checkDiskSpace("/");

    const healthEndpoint: TerminusEndpoint = {
      healthIndicators: [
        async () =>
          this.diskHealthIndicator.checkStorage("disk", {
            path: "/",
            threshold: free + 1
          })
      ],
      url: "/health"
    };
    return {
      endpoints: [healthEndpoint]
    };
  }
}
