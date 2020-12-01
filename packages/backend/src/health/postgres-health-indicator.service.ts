import { Injectable } from "@nestjs/common";
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from "@nestjs/terminus";
import { appTypeormManager } from "../database";

@Injectable()
export class PostgresHealthIndicator extends HealthIndicator {
  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const connection = appTypeormManager.getConnection();
    if (!connection.isConnected) {
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
