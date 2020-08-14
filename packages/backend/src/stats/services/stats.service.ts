import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Model } from "mongoose";

import { Stats } from "../stats.class";
import { StatsDocument } from "../stats.interface";
import moment = require("moment");

@Injectable()
export class StatsService {
  public today: Date;

  constructor(
    @Inject("STATS_MODEL")
    private statsModel: Model<StatsDocument>
  ) {
    this.today = new Date();
  }

  public async getStatById(id: string, structureId: number): Promise<Stats> {
    const stats = await this.statsModel
      .findOne({ _id: id, structureId })
      .lean()
      .exec();
    if (!stats || stats === null) {
      throw new HttpException("STAT_ID_INCORRECT", HttpStatus.BAD_REQUEST);
    }
    return stats;
  }

  public async getToday(structureId: number): Promise<Stats> {
    const stats = await this.statsModel
      .find({ structureId })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean()
      .exec();
    if (!stats || stats === null) {
      throw new HttpException("MY_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats[0];
  }

  public async getByDate(structureId: number, date: Date): Promise<Stats> {
    const stats = await this.statsModel
      .find({
        structureId,
        createdAt: {
          $gte: moment(date).utc().startOf("day").toDate(),
          $lte: moment(date).utc().endOf("day").toDate(),
        },
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean()
      .exec();
    if (!stats || stats === null) {
      throw new HttpException("MY_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats[0];
  }

  public async getAvailableStats(structureId: number): Promise<Stats[]> {
    const stats = await this.statsModel
      .find({
        structureId,
      })
      .select("createdAt _id")
      .exec();

    if (!stats || stats === null) {
      throw new HttpException("ALL_STATS_NOT_EXIST", HttpStatus.BAD_REQUEST);
    }
    return stats;
  }
}
