import { PublicStats, REGIONS_LISTE } from "@domifa/common";

import { Injectable, OnModuleInit } from "@nestjs/common";
import { AdminStructuresService } from "../../_portail-admin/admin-structures/services";
import {
  PublicStatsCache,
  publicStatsCacheRepository,
  structureRepository,
  usagerRepository,
  userStructureRepository,
} from "../../database";
import { StructuresService } from "../../structures/services";
import { appLogger } from "../../util";
import { CronExpression, Cron } from "@nestjs/schedule";
import { isCronEnabled } from "../../config/services/isCronEnabled.service";
import { domifaConfig } from "../../config";

@Injectable()
export class PublicStatsService implements OnModuleInit {
  constructor(
    private readonly adminStructuresService: AdminStructuresService,
    private readonly structuresService: StructuresService
  ) {}

  onModuleInit() {
    if (
      domifaConfig().envId !== "local" ||
      (domifaConfig().envId !== "test" && isCronEnabled())
    ) {
      this.updateAllStatsCache();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    timeZone: "Europe/Paris",
    disabled: isCronEnabled(),
  })
  public async updateAllStatsCache(): Promise<void> {
    for (const regionId of Object.keys(REGIONS_LISTE)) {
      appLogger.info("[CACHE] Update public stats for region " + regionId);
      await this.generatePublicStats({ updateCache: true, regionId });
    }

    appLogger.info("[CACHE] Update public stats");
    await this.generatePublicStats({ updateCache: true });

    appLogger.info("[CACHE] End of cache update");
  }

  public async generatePublicStats({
    updateCache,
    regionId,
  }: {
    updateCache?: boolean;
    regionId?: string;
  }): Promise<PublicStats> {
    const key = regionId ? "public-stats-" + regionId : "public-stats";

    const value = await publicStatsCacheRepository
      .createQueryBuilder("public_stats_cache")
      .where(
        `"createdAt" > now() - interval '1 day' and "createdAt" <= now() and key = :key`,
        { key }
      )
      .orderBy(`"createdAt"`, "DESC")
      .getOne();

    if (value && !updateCache) {
      return value.stats;
    }

    const publicStats = new PublicStats();
    let structures: number[] = null;

    if (regionId) {
      structures = await this.structuresService.findStructuresInRegion(
        regionId
      );

      // Si aucune structure dans la région, tous les indicateurs sont à zero
      if (!structures.length) {
        return this.saveStats(key, publicStats, value);
      }

      publicStats.structuresCountByRegion =
        await this.adminStructuresService.getStructuresCountByDepartement(
          regionId
        );

      publicStats.structuresCount = structures.length;

      publicStats.usersCount =
        await userStructureRepository.countUsersByRegionId({ regionId });
    }
    // Stats nationales
    else {
      publicStats.structuresCount = await structureRepository.count();

      publicStats.structuresCountByRegion =
        await this.adminStructuresService.getStructuresCountByRegion();

      publicStats.usersCount = await userStructureRepository.count();
    }

    publicStats.usagersCount = await usagerRepository.countTotalUsagers(
      structures
    );

    publicStats.actifs = (await usagerRepository.countTotalActifs()).actifs;

    publicStats.courrierInCount =
      await this.adminStructuresService.totalInteractions(
        "courrierIn",
        structures
      );

    publicStats.courrierOutCount =
      await this.adminStructuresService.totalInteractions(
        "courrierOut",
        structures
      );

    publicStats.structuresCountByTypeMap =
      await this.adminStructuresService.getStructuresCountByTypeMap(regionId);

    publicStats.interactionsCountByMonth =
      await this.adminStructuresService.countInteractionsByMonth(regionId);

    publicStats.usagersCountByMonth =
      await this.adminStructuresService.countUsagersByMonth(regionId);

    return this.saveStats(key, publicStats, value);
  }

  private async saveStats(
    key: string,
    publicStats: PublicStats,
    previousValue?: PublicStatsCache
  ) {
    if (previousValue?.uuid) {
      await publicStatsCacheRepository.update(
        { uuid: previousValue?.uuid },
        { stats: publicStats }
      );
    } else {
      await publicStatsCacheRepository.save({
        key,
        stats: publicStats,
      });
    }

    return publicStats;
  }
}
