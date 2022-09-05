import { myDataSource } from "./../database/services/_postgres/appTypeormManager.service";
import { Injectable } from "@nestjs/common";
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from "@nestjs/terminus";

@Injectable()
export class PostgresHealthIndicator extends HealthIndicator {
  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const connection = myDataSource;
    if (!connection.isInitialized) {
      const msg = "Postgres is not connected";
      throw new HealthCheckError(
        msg,
        this.getStatus(key, false, {
          message: msg,
        })
      );
    }

    return this.getStatus(key, true);
  }
}
