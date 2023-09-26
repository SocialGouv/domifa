import { Injectable } from "@nestjs/common";
import { startOfMonth, subMonths, subYears } from "date-fns";
import { In } from "typeorm";

import {
  interactionRepository,
  InteractionsTable,
  userStructureRepository,
  structureRepository,
  typeOrmSearch,
  usagerRepository,
  UsagerTable,
} from "../../../database";
import { usagerDocsRepository } from "../../../database/services/usager/usagerDocsRepository.service";
import { StatsDeploiementExportModel } from "../../../excel/export-stats-deploiement";
import { StatsDeploiementStructureExportModel } from "../../../excel/export-stats-deploiement/StatsDeploiementStructureExportModel.type";
import { FranceRegion } from "../../../util/territoires";
import {
  AdminStructureListData,
  AdminStructureStatsData,
  InteractionType,
  StatsByLocality,
  StatsByMonth,
  StructureAdmin,
} from "../../../_common/model";
import { StructureType, UsagerDecisionStatut } from "@domifa/common";

@Injectable()
export class AdminStructuresService {
  public async getStatsDomifaAdminDashboard(): Promise<AdminStructureStatsData> {
    const structures = await structureRepository.find({});

    const structuresIds = structures.map((s) => s.id);

    const {
      usagersValidCountByStructureMap,
      usagersAllCountByStructureMap,
      usagersAyantsDroitsCountByStructureMap,
    } = await this.getUsagersCountByStructureMaps(structuresIds);

    const structuresCountByRegion = await this.getStructuresCountByRegion();

    const structuresCountByTypeMap = await this.getStructuresCountByTypeMap();

    const usersCount = await userStructureRepository.count();

    const interactionsCountByTypeMap =
      await this.getInteractionsCountByTypeMap();

    const usagersDocumentsCount = await usagerDocsRepository.count();

    const usagersCountByStatutMap = await this.getUsagersCountByStatutMap();

    const structuresCountBySmsEnabled = await this.getStructuresWithSms();
    const structuresCount = await structureRepository.count();

    const stats: AdminStructureStatsData = {
      structuresCount,
      usagersValidCountByStructureMap,
      usagersAyantsDroitsCountByStructureMap,
      usagersAllCountByStructureMap,
      structuresCountByRegion,
      structuresCountByTypeMap,
      structuresCountBySmsEnabled,
      usersCount,
      interactionsCountByTypeMap,
      usagersDocumentsCount,
      usagersCountByStatutMap,
    };

    return stats;
  }
  public async getAdminStructuresListData(): Promise<AdminStructureListData> {
    const structures = await structureRepository.find();

    const structuresIds = structures.map((s) => s.id);

    const {
      usagersValidCountByStructureMap,
      usagersAllCountByStructureMap,
      usagersAyantsDroitsCountByStructureMap,
    } = await this.getUsagersCountByStructureMaps(structuresIds);

    const usersStructureCountByStructure =
      await this.getUsersStructureCountByStructure();

    const usersStructureCountByStructureMap = this.reduceSumResults(
      structuresIds,
      usersStructureCountByStructure
    );

    const data: AdminStructureListData = {
      structures: structures.map((s) => ({
        ...s,
        usersCount: usersStructureCountByStructureMap[s.id],
        usagersValidCount: usagersValidCountByStructureMap[s.id],
        usagersAllCount: usagersAllCountByStructureMap[s.id],
        usagersAyantsDroitsCount: usagersAyantsDroitsCountByStructureMap[s.id],
      })),
    };

    return data;
  }

  public async getStructuresByType(region?: FranceRegion): Promise<
    {
      structureType: StructureType;
      count: number;
    }[]
  > {
    if (region) {
      return structureRepository.countBy({
        countBy: "structureType",
        order: {
          count: "DESC",
          countBy: "ASC",
        },
        where: {
          region,
        },
      });
    }
    return structureRepository.countBy({
      countBy: "structureType",
      order: {
        count: "DESC",
        countBy: "ASC",
      },
    });
  }

  public async getStructuresWithSms(): Promise<number> {
    return structureRepository
      .createQueryBuilder()
      .where(`sms->>'enabledByStructure' = 'true'`)
      .getCount();
  }

  public async getInteractionsCountByTypeMap(): Promise<{
    [statut in InteractionType]: number;
  }> {
    return {
      courrierIn: await this.totalInteractions("courrierIn"),
      courrierOut: await this.totalInteractions("courrierOut"),
      recommandeIn: await this.totalInteractions("recommandeIn"),
      recommandeOut: await this.totalInteractions("recommandeOut"),
      colisIn: await this.totalInteractions("colisIn"),
      colisOut: await this.totalInteractions("colisOut"),
      appel: await this.totalInteractions("appel"),
      visite: await this.totalInteractions("visite"),
      npai: await this.totalInteractions("npai"),
      loginPortail: await this.totalInteractions("loginPortail"),
    };
  }

  public async getUsersStructureCountByStructure(): Promise<
    {
      structureId: number;
      count: number;
    }[]
  > {
    return userStructureRepository
      .createQueryBuilder()
      .select(`"structureId"`)
      .addSelect("COUNT(*)", "count")
      .groupBy(`"structureId"`)
      .getRawMany();
  }

  public async getUsagersValideCountByStructure(): Promise<
    {
      structureId: number;
      count: number;
    }[]
  > {
    return usagerRepository.customCountBy({
      countBy: "structureId",
      where: typeOrmSearch<UsagerTable>(`decision->>'statut' = 'VALIDE'`),
      order: {
        count: "DESC",
        countBy: "ASC",
      },
    });
  }

  public async getUsagersAllCountByStructure(): Promise<
    {
      structureId: number;
      count: number;
    }[]
  > {
    return usagerRepository.customCountBy({
      countBy: "structureId",
      where: typeOrmSearch<UsagerTable>("true"),
      order: {
        count: "DESC",
        countBy: "ASC",
      },
    });
  }

  public async getUsagersAyantsDroitsCountByStructure(): Promise<
    {
      structureId: number;
      count: number;
    }[]
  > {
    const results = await usagerRepository.query(
      `select "structureId", sum(jsonb_array_length("ayantsDroits")) as count from usager u group by "structureId" `
    );

    return usagerRepository._parseCounts<UsagerTable, "structureId">(results, {
      label: "count",
    });
  }

  public async getUsagersCountByStatut(): Promise<
    {
      statut: UsagerDecisionStatut;
      count: number;
    }[]
  > {
    return usagerRepository.countBy({
      countBy: `decision->>'statut'` as any,
      countByAlias: "statut",
      order: { count: "DESC", countBy: "ASC" },
      escapeAttributes: false,
    }) as any;
  }

  public async getStructuresCountByRegion(): Promise<
    {
      region: string;
      count: number;
    }[]
  > {
    return structureRepository.countBy({
      countBy: "region",
      order: {
        count: "DESC",
        countBy: "ASC",
      },
    });
  }
  public async getStructuresCountByDepartement(
    regionId: string
  ): Promise<StatsByLocality> {
    const structures = await structureRepository.countBy({
      countBy: "departement",
      countByAlias: "departement",
      where: {
        region: regionId,
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

  public async getUsagersCountByStatutMap() {
    const ayantsDroits = await usagerRepository.countAyantsDroits();
    const result = await this.getUsagersCountByStatut();

    const usagers: { [statut: string]: number } = {};
    let total = 0;

    usagers.AYANTS_DROITS = ayantsDroits;
    for (const usager of result) {
      usagers[usager.statut] = usager.count;
      total += usager.count;
    }
    usagers.TOUS = total + usagers.AYANTS_DROITS;
    return usagers;
  }

  public async getStructuresCountByTypeMap(region?: FranceRegion): Promise<{
    [key in StructureType]: number;
  }> {
    const structures: { [key in StructureType]: number } = {
      ccas: 0,
      cias: 0,
      asso: 0,
    };

    const result = await this.getStructuresByType(region);

    for (const structure of result) {
      structures[structure.structureType] = structure.count;
    }
    return structures;
  }

  public async getStatsDeploiementForExport(): Promise<{
    structures: StructureAdmin[];
    stats: StatsDeploiementExportModel;
  }> {
    const structures: StructureAdmin[] = await structureRepository.find({
      order: {
        createdAt: "ASC",
      },
    });

    const structuresIds = structures.map((s) => s.id);

    const usersStructureCountByStructure =
      await this.getUsersStructureCountByStructure();

    const usersStructureCountByStructureMap = this.reduceSumResults(
      structuresIds,
      usersStructureCountByStructure
    );

    const structuresModels: StatsDeploiementStructureExportModel[] =
      structures.map((structure) => ({
        structure,
        usersCount: usersStructureCountByStructureMap[structure.id],
      }));

    const {
      usagersValidCountByStructureMap,
      usagersAllCountByStructureMap,
      usagersAyantsDroitsCountByStructureMap,
    } = await this.getUsagersCountByStructureMaps(structuresIds);

    const usagersCountByStatut = await this.getUsagersCountByStatutMap();

    const structuresCountByRegion = await this.getStructuresCountByRegion();

    const structuresCountByType = await this.getStructuresCountByTypeMap();

    const usersCount = await userStructureRepository.count();

    const docsCount = await usagerDocsRepository.count();

    const interactionsCountByStatut =
      await this.getInteractionsCountByTypeMap();

    const stats: StatsDeploiementExportModel = {
      exportDate: new Date(),
      structures: structuresModels,
      usagersAllCountByStructureId: usagersAllCountByStructureMap,
      usagersValideCountByStructureId: usagersValidCountByStructureMap,
      usagersAyantsDroitsByStructureId: usagersAyantsDroitsCountByStructureMap,
      usagersCountByStatut,
      structuresCountByRegion,
      structuresCountByType,
      usersCount,
      docsCount,
      interactionsCountByStatut,
    };
    return { structures, stats };
  }

  public async totalInteractions(
    interactionType: InteractionType,
    structuresId?: number[]
  ): Promise<number> {
    if (
      interactionType === "appel" ||
      interactionType === "visite" ||
      interactionType === "loginPortail" ||
      interactionType === "npai"
    ) {
      return interactionRepository.count({
        where: {
          type: interactionType,
          event: "create",
        },
      });
    }

    const whereCondition: Partial<InteractionsTable> = {
      type: interactionType,
      event: "create",
    };

    if (structuresId) {
      whereCondition.structureId = In(structuresId) as any;
    }

    return (await interactionRepository.sum("nbCourrier", whereCondition)) ?? 0;
  }

  private async getUsagersCountByStructureMaps(structuresIds: number[]) {
    const usagersValidCountByStructure =
      await this.getUsagersValideCountByStructure();

    const usagersAllCountByStructure =
      await this.getUsagersAllCountByStructure();

    const usagersAyantsDroitsCountByStructure =
      await this.getUsagersAyantsDroitsCountByStructure();

    const usagersValidCountByStructureMap = this.reduceSumResults(
      structuresIds,
      usagersValidCountByStructure
    );

    const usagersAyantsDroitsCountByStructureMap = this.reduceSumResults(
      structuresIds,
      usagersAyantsDroitsCountByStructure
    );

    const usagersAllCountByStructureMap = this.reduceSumResults(
      structuresIds,
      usagersAllCountByStructure
    );

    return {
      usagersValidCountByStructureMap,
      usagersAllCountByStructureMap,
      usagersAyantsDroitsCountByStructureMap,
    };
  }

  public async countUsagersByMonth(regionId?: FranceRegion) {
    const usagersByMonth = await usagerRepository.countUsagersByMonth(regionId);
    return this.formatStatsByMonth(usagersByMonth, "domicilies");
  }

  public async countInteractionsByMonth(
    regionId?: FranceRegion,
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

  public reduceSumResults(
    structuresIds: number[],
    sumToReduce: {
      structureId: number;
      count: number;
    }[]
  ): {
    [x: string]: number;
  } {
    const listOfStructures: {
      [key in string]?: number;
    } = structuresIds.reduce(
      (acc, structureId) => {
        acc[structureId] = 0;
        return acc;
      },
      {} as {
        [structureId: string]: number;
      }
    );

    sumToReduce.forEach((x) => {
      listOfStructures[x.structureId] = x.count;
    });

    return listOfStructures;
  }
}
