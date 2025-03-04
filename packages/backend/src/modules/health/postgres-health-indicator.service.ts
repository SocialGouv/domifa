import { Injectable } from "@nestjs/common";
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from "@nestjs/terminus";
import { myDataSource } from "../../database";

@Injectable()
export class PostgresHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService
  ) {}
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const connection = myDataSource;
    const indicator = this.healthIndicatorService.check(key);

    if (!connection.isInitialized) {
      const msg = "Postgres is not connected";
      return indicator.down(msg);
    }

    return indicator.up();
  }
}
