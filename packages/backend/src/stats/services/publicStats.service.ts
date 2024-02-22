import { HomeStats, PublicStats, REGIONS_LISTE } from "@domifa/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { AdminStructuresService } from "../../_portail-admin/admin-structures/services";
import {
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
    private readonly structuresService: StructuresService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  onModuleInit() {
    // Inutile de rafraichir le cache sur le pod des tâches CRON
    if (
      domifaConfig().envId !== "local" &&
      domifaConfig().envId !== "test" &&
      !isCronEnabled()
    ) {
      this.updateAllStatsCache();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    timeZone: "Europe/Paris",
    disabled: isCronEnabled(),
  })
  public async updateAllStatsCache(): Promise<void> {
    appLogger.info("[CACHE] Update home stats");
    await this.generateHomeStats({ updateCache: true });

    appLogger.info("[CACHE] Update public stats");
    await this.generatePublicStats({ updateCache: true });

    for (const regionId of Object.keys(REGIONS_LISTE)) {
      appLogger.info("[CACHE] Update public stats for region " + regionId);
      await this.generatePublicStats({ updateCache: true, regionId });
    }

    appLogger.info("[CACHE] End of cache update");
  }

  public async generateHomeStats({
    updateCache,
  }: {
    updateCache: boolean;
  }): Promise<HomeStats> {
    const value: HomeStats | undefined = await this.cacheManager.get(
      "home-stats"
    );

    if (value && !updateCache) {
      return value;
    }

    const homeStats = {
      structures: await structureRepository.count(),
      interactions: await this.adminStructuresService.totalInteractions(
        "courrierIn"
      ),
      usagers: await usagerRepository.countTotalUsagers(),
      actifs: (await usagerRepository.countTotalActifs()).actifs,
    };

    await this.cacheManager.set("home-stats", homeStats);

    return homeStats;
  }

  public async generatePublicStats({
    updateCache,
    regionId,
  }: {
    updateCache?: boolean;
    regionId?: string;
  }): Promise<PublicStats> {
    const key = regionId ? "publics-stats-" + regionId : "public-stats";
    const value: PublicStats | undefined = await this.cacheManager.get(key);

    if (value && !updateCache) {
      return value;
    }

    const publicStats = new PublicStats();
    // Si aucune region
    let structures: number[] = null;

    if (regionId) {
      structures = await this.structuresService.findStructuresInRegion(
        regionId
      );

      // Si aucune structure dans la région, tous les indicateurs sont à zero
      if (!structures.length) {
        return publicStats;
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

    // Usagers
    publicStats.usagersCount = await usagerRepository.countTotalUsagers(
      structures
    );

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

    await this.cacheManager.set(key, publicStats);

    return publicStats;
  }
}
