import { myDataSource } from "./../database/services/_postgres/appTypeormManager.service";
import { Injectable } from "@nestjs/common";
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from "@nestjs/terminus";

@Injectable()
export class PostgresHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService
  ) {}
  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const connection = myDataSource;
    const indicator = this.healthIndicatorService.check(key);

    if (!connection.isInitialized) {
      const msg = "Postgres is not connected";
      return indicator.down(msg);
    }

    return indicator.up();
  }
}
