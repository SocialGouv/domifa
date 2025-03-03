import { Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PublicStats } from "@domifa/common";
import { PublicStatsService } from "../services/publicStats.service";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { ParseRegionPipe } from "../../_common/decorators";

@Controller("stats")
@ApiTags("stats")
export class StatsPublicController {
  constructor(private readonly publicStatsService: PublicStatsService) {}

  @Get("public-stats/{:regionId}")
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(43200) // Cache duration of 12 hours
  public async getPublicStats(
    @Param("regionId", new ParseRegionPipe()) regionId: string
  ): Promise<PublicStats> {
    return await this.publicStatsService.generatePublicStats({
      updateCache: false,
      regionId,
    });
  }
}
