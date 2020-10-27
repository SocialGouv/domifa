import { INestApplication, Logger } from "@nestjs/common";
import { Model } from "mongoose";

import { configService } from "../config/config.service";

import { processUtil } from "../util/processUtil.service";
import { Stats } from "../stats/stats.class";
import { StatsDocument } from "../stats/stats.interface";

const migrationName = __filename;

async function up(app: INestApplication) {
  Logger.debug(`[${migrationName}] UP`);
  const envId = configService.getEnvId();

  await _updateCreatedAt({ app });
  Logger.warn(`[${migrationName}] DB update createdAt  (env:${envId})`);
}

async function _updateCreatedAt({ app }: { app: INestApplication }) {
  const statsModel: Model<StatsDocument> = app.get("STATS_MODEL");
  return statsModel
    .find({
      createdAt: { $exists: false },
    })
    .select("_id id createdAt date")
    .then((stats) => {
      Logger.warn(`[${migrationName}] ${stats.length} stats to update`);
      return processUtil.processOneByOnePromise(stats, (stat: Stats) =>
        _updateStat(stat, { app })
      );
    });
}

async function _updateStat(stats: Stats, { app }: { app: INestApplication }) {
  const statsModel: Model<StatsDocument> = app.get("STATS_MODEL");

  return statsModel
    .findOneAndUpdate(
      { _id: stats._id },
      {
        $set: { createdAt: stats._id.getTimestamp() },
        $unset: {
          date: "",
        },
      }
    )
    .exec();
}

async function down(app: INestApplication) {
  Logger.debug(`[${migrationName}] DOWN`);
  // await of(undefined).toPromise();
}

export { up, down };
