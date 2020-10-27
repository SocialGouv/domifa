import { INestApplication, Logger } from "@nestjs/common";
import { Model } from "mongoose";

import { configService } from "../config/config.service";
import { StatsDocument } from "../stats/stats.interface";

const migrationName = __filename;

async function up(app: INestApplication) {
  Logger.debug(`[${migrationName}] UP`);
  const envId = configService.getEnvId();

  await _updateCreatedAt({ app });
  Logger.warn(`[${migrationName}] DB delete old stats  (env:${envId})`);
}

async function _updateCreatedAt({ app }: { app: INestApplication }) {
  const statsModel: Model<StatsDocument> = app.get("STATS_MODEL");
  return statsModel
    .remove({
      createdAt: { $lte: new Date("2020-03-31") },
    })
    .exec();
}

async function down(app: INestApplication) {
  Logger.debug(`[${migrationName}] DOWN`);
}

export { up, down };
