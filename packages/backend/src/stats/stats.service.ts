import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Structure } from "../structures/structure-interface";
import { User } from "../users/user.interface";
import { Stats } from "./stats.interface";

@Injectable()
export class StatsService {
  constructor(
    @Inject("STRUCTURE_MODEL")
    private structureModel: Model<Structure>,
    @Inject("STATS_MODEL")
    private statsModel: Model<Stats>,
    @Inject("USER_MODEL")
    private userModel: Model<User>
  ) {}

  public async question10() {
    return true;
  }
}
