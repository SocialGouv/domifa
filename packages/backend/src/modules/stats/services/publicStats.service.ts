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
import { SentryCron } from "@sentry/nestjs";
import { Not } from "typeorm";

import { startOfMonth, subYears, subMonths } from "date-fns";
import { domifaConfig } from "../../../config";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import {
  publicStatsCacheRepository,
  userStructureRepository,
  structureRepository,
  usagerRepository,
  PublicStatsCache,
  PublicStatsCacheTable,
  interactionRepository,
} from "../../../database";
import { appLogger } from "../../../util";

@Injectable()
export class PublicStatsService implements OnModuleInit {
  private readonly pendingCalculations = new Map<
    string,
    Promise<PublicStats>
  >();

  async onModuleInit() {
    if (domifaConfig().envId === "local" && isCronEnabled()) {
      await this.updateAllStatsCache();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled(),
  })
  @SentryCron("public-stats-cache-update", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_2AM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 60,
  })
  public async updateAllStatsCache(): Promise<void> {
    for (const regionId of Object.keys(REGIONS_LISTE)) {
      appLogger.info(`[CACHE] Update public stats for region ${regionId}`);
      await this.forceRefreshStats(regionId);
    }

    appLogger.info("[CACHE] Update public stats");
    await this.forceRefreshStats();

    appLogger.info("[CACHE] End of cache update");
  }

  public async getPublicStats(regionId?: string): Promise<PublicStats> {
    const key = regionId ? `public-stats-${regionId}` : "public-stats";

    // Vérifier le cache DB
    const cached = await this.getCachedStats(key);
    if (cached) {
      return cached.stats;
    }

    const pending = this.pendingCalculations.get(key);
    if (pending) {
      appLogger.info(
        `[PUBLIC_STATS] Calcul déjà en cours pour "${key}", attente du résultat`
      );
      return pending;
    }

    const calculation = this.computePublicStats(key, regionId);
    this.pendingCalculations.set(key, calculation);

    try {
      return await calculation;
    } finally {
      this.pendingCalculations.delete(key);
    }
  }

  private async forceRefreshStats(regionId?: string): Promise<void> {
    const key = regionId ? `public-stats-${regionId}` : "public-stats";
    const previousValue = await this.getCachedStats(key);
    await this.computePublicStats(key, regionId, previousValue);
  }

  private async getCachedStats(
    key: string
  ): Promise<PublicStatsCacheTable | null> {
    return publicStatsCacheRepository
      .createQueryBuilder("public_stats_cache")
      .where(
        `"createdAt" > now() - interval '1 day' and "createdAt" <= now() and key = :key`,
        { key }
      )
      .orderBy(`"createdAt"`, "DESC")
      .getOne();
  }

  private async computePublicStats(
    key: string,
    regionId?: string,
    previousValue?: PublicStatsCache
  ): Promise<PublicStats> {
    const publicStats = new PublicStats();

    if (regionId) {
      publicStats.structuresCount = await structureRepository.count({
        where: { region: regionId, statut: "VALIDE" },
      });

      // Aucune structure dans la région → tous les indicateurs à zéro.
      if (publicStats.structuresCount === 0) {
        return this.saveStats(key, publicStats, previousValue);
      }

      publicStats.structuresCountByRegion =
        await this.getStructuresCountByDepartement(regionId);

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

      publicStats.usersCount = await userStructureRepository.count({
        where: { status: Not("DELETE") },
      });
    }

    publicStats.usagersCount = await usagerRepository.countTotalUsagers(
      regionId
    );

    publicStats.actifs = (await usagerRepository.countTotalActifs()).actifs;

    publicStats.courrierInCount = await this.totalInteractions(
      "courrierIn",
      regionId
    );

    publicStats.courrierOutCount = await this.totalInteractions(
      "courrierOut",
      regionId
    );

    publicStats.structuresCountByTypeMap =
      await this.getStructuresCountByTypeMap(regionId);

    publicStats.interactionsCountByMonth = await this.countInteractionsByMonth(
      regionId
    );

    publicStats.usagersCountByMonth = await this.countUsagersByMonth(regionId);

    return this.saveStats(key, publicStats, previousValue);
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
    const rows = await structureRepository
      .createQueryBuilder("s")
      .select(`s."region"`, "region")
      .addSelect("COUNT(s.id)", "count")
      .where("s.statut = :statut", { statut: "VALIDE" })
      .groupBy(`s."region"`)
      .orderBy("count", "DESC")
      .addOrderBy(`s."region"`, "ASC")
      .getRawMany<{ region: string; count: string }>();

    return rows.map(({ region, count }) => ({
      region,
      count: parseInt(count, 10),
    }));
  }

  private async getStructuresCountByDepartement(
    regionId: string
  ): Promise<StatsByLocality> {
    const rows = await structureRepository
      .createQueryBuilder("s")
      .select(`s."departement"`, "departement")
      .addSelect("COUNT(s.id)", "count")
      .where("s.region = :regionId", { regionId })
      .andWhere("s.statut = :statut", { statut: "VALIDE" })
      .groupBy(`s."departement"`)
      .orderBy("count", "DESC")
      .addOrderBy(`s."departement"`, "ASC")
      .getRawMany<{ departement: string; count: string }>();

    return rows.map(({ departement, count }) => ({
      region: departement,
      count: parseInt(count, 10),
    }));
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
      query.andWhere("structure.region = :region", { region });
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
    regionId?: string
  ): Promise<number> {
    if (interactionType === "appel" || interactionType === "visite") {
      return interactionRepository.count({
        where: { type: interactionType },
      });
    }

    const qb = interactionRepository
      .createQueryBuilder("i")
      .select(`COALESCE(SUM(i."nbCourrier"), 0)`, "total")
      .where("i.type = :type", { type: interactionType });

    if (regionId) {
      qb.innerJoin("structure", "s", `s.id = i."structureId"`)
        .andWhere("s.region = :regionId", { regionId })
        .andWhere("s.statut = :statut", { statut: "VALIDE" });
    }

    const result = await qb.getRawOne<{ total: string }>();
    return parseInt(result?.total ?? "0", 10);
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
