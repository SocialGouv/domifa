import {
  InteractionType,
  PublicStats,
  REGIONS_LISTE,
  StatsByLocality,
  StatsByMonth,
  StructureType,
} from "@domifa/common";

import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { startOfMonth, subYears, subMonths } from "date-fns";
import { In } from "typeorm";
import { domifaConfig } from "../../../config";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import {
  publicStatsCacheRepository,
  userStructureRepository,
  structureRepository,
  usagerRepository,
  PublicStatsCache,
  interactionRepository,
  InteractionsTable,
} from "../../../database";
import { appLogger } from "../../../util";
import { StructuresService } from "../../structures/services";

@Injectable()
export class PublicStatsService implements OnModuleInit {
  constructor(private readonly structuresService: StructuresService) {}

  async onModuleInit() {
    if (domifaConfig().envId === "local" && isCronEnabled()) {
      await this.updateAllStatsCache();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled(),
  })
  public async updateAllStatsCache(): Promise<void> {
    for (const regionId of Object.keys(REGIONS_LISTE)) {
      appLogger.info(`[CACHE] Update public stats for region ${regionId}`);
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
    const key = regionId ? `public-stats-${regionId}` : "public-stats";

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
        await this.getStructuresCountByDepartement(regionId);

      publicStats.structuresCount = structures.length;

      publicStats.usersCount =
        await userStructureRepository.countUsersByRegionId({ regionId });
    }
    // Stats nationales
    else {
      publicStats.structuresCount = await structureRepository.count({
        where: { statut: "VALIDE" },
      });

      publicStats.structuresCountByRegion =
        await this.getStructuresCountByRegion();

      publicStats.usersCount = await userStructureRepository.count();
    }

    publicStats.usagersCount = await usagerRepository.countTotalUsagers(
      structures
    );

    publicStats.actifs = (await usagerRepository.countTotalActifs()).actifs;

    publicStats.courrierInCount = await this.totalInteractions(
      "courrierIn",
      structures
    );

    publicStats.courrierOutCount = await this.totalInteractions(
      "courrierOut",
      structures
    );

    publicStats.structuresCountByTypeMap =
      await this.getStructuresCountByTypeMap(regionId);

    publicStats.interactionsCountByMonth = await this.countInteractionsByMonth(
      regionId
    );

    publicStats.usagersCountByMonth = await this.countUsagersByMonth(regionId);

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

  private async getStructuresCountByRegion(): Promise<
    {
      region: string;
      count: number;
    }[]
  > {
    return await structureRepository.countBy({
      where: { statut: "VALIDE" },
      countBy: "region",
      order: {
        count: "DESC",
        countBy: "ASC",
      },
    });
  }
  private async getStructuresCountByDepartement(
    regionId: string
  ): Promise<StatsByLocality> {
    const structures = await structureRepository.countBy({
      countBy: "departement",
      countByAlias: "departement",
      where: {
        region: regionId,
        statut: "VALIDE",
      },
      order: {
        count: "DESC",
        countBy: "ASC",
      },
    });

    return structures.reduce(
      (acc: StatsByLocality, value: { departement: string; count: number }) => {
        acc.push({ region: value.departement, count: value.count });
        return acc;
      },
      []
    );
  }

  private async getStructuresCountByTypeMap(region?: string): Promise<{
    [key in StructureType]: number;
  }> {
    const query = structureRepository
      .createQueryBuilder("structure")
      .select("structure.structureType", "structureType")
      .addSelect("COUNT(structure.id)", "count")
      .where("statut='VALIDE'")
      .groupBy("structure.structureType");

    if (region) {
      query.where("structure.region = :region", { region });
    }

    const result = await query.getRawMany();

    const structures: { [key in StructureType]: number } = {
      ccas: 0,
      cias: 0,
      asso: 0,
    };

    result.forEach((item: { structureType: StructureType; count: string }) => {
      structures[item.structureType] = parseInt(item.count, 10);
    });

    return structures;
  }

  public async totalInteractions(
    interactionType: InteractionType,
    structuresId?: number[]
  ): Promise<number> {
    if (interactionType === "appel" || interactionType === "visite") {
      return interactionRepository.count({
        where: {
          type: interactionType,
        },
      });
    }

    const whereCondition: Partial<InteractionsTable> = {
      type: interactionType,
    };

    if (structuresId) {
      whereCondition.structureId = In(structuresId) as any;
    }

    return (await interactionRepository.sum("nbCourrier", whereCondition)) ?? 0;
  }

  public async countUsagersByMonth(regionId?: string) {
    const usagersByMonth = await usagerRepository.countUsagersByMonth(regionId);
    return this.formatStatsByMonth(usagersByMonth, "domicilies");
  }

  public async countInteractionsByMonth(
    regionId?: string,
    interactionType: InteractionType = "courrierOut"
  ) {
    const interactionsByMonth =
      await interactionRepository.countInteractionsByMonth(
        regionId,
        interactionType
      );

    return this.formatStatsByMonth(interactionsByMonth, "interactions");
  }

  private formatStatsByMonth(
    rawResults: {
      date: Date;
      count: string;
      ayantsdroits?: string;
    }[],
    elementToCount: "interactions" | "domicilies"
  ): StatsByMonth {
    // Initialisation des résultats pours les 12 derniers mois
    // 0 par défaut pour les stats
    const resultsObjects: { [key: string]: number } = {};
    const startInterval = startOfMonth(subYears(new Date(), 1));

    for (let i = 12; i > 0; i--) {
      const monthToAdd = subMonths(startInterval, i).toLocaleString("fr-fr", {
        month: "short",
      });
      resultsObjects[monthToAdd] = 0;
    }

    // Parcours des résulats, ajout du mois
    for (const result of rawResults) {
      const monthKey = new Date(result.date).toLocaleString("fr-fr", {
        month: "short",
      });

      // Pour les domiciliés, on compte les ayant-droits
      resultsObjects[monthKey] =
        elementToCount === "domicilies"
          ? parseInt(result.count, 10) + parseInt(result.ayantsdroits, 10)
          : parseInt(result.count, 10);
    }

    // Mise au format pour l'outil de charts côté frontend
    const statsByMonth: StatsByMonth = Object.entries(resultsObjects).map(
      ([key, value]) => ({ name: key, value })
    );

    return statsByMonth;
  }
}
