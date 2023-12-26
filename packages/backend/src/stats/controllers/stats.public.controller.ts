import { ParseRegionPipe } from "./../../_common/decorators/ParseRegion.pipe";
import { FranceRegion } from "./../../util/territoires/types/FranceRegion.type";

import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { HomeStats, PublicStats } from "@domifa/common";

import { PublicStatsService } from "../services/publicStats.service";

@Controller("stats")
@ApiTags("stats")
export class StatsPublicController {
  constructor(private readonly publicStatsService: PublicStatsService) {}

  @Get("home")
  public async home(): Promise<HomeStats> {
    return this.publicStatsService.generateHomeStats();
  }

  @Get("public-stats/:regionId?")
  public async getPublicStats(
    @Param("regionId", new ParseRegionPipe()) regionId: FranceRegion
  ): Promise<PublicStats> {
    return this.publicStatsService.generatePublicStats(regionId);
  }
}
