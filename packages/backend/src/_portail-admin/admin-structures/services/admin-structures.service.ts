import { Injectable } from "@nestjs/common";
import { In, Repository } from "typeorm";
import {
  appTypeormManager,
  interactionRepository,
  InteractionsTable,
  structureRepository,
  typeOrmSearch,
  usagerRepository,
  UsagerTable,
  userStructureRepository,
} from "../../../database";
import { StatsDeploiementExportModel } from "../../../excel/export-stats-deploiement";
import { StatsDeploiementStructureExportModel } from "../../../excel/export-stats-deploiement/StatsDeploiementStructureExportModel.type";
import {
  AdminStructureListData,
  AdminStructureStatsData,
  InteractionType,
  StatsByMonth,
  StructureAdmin,
  StructureType,
  UsagerDecisionStatut,
} from "../../../_common/model";

@Injectable()
export class AdminStructuresService {
  private interactionRepository: Repository<InteractionsTable>;

  constructor() {
    this.interactionRepository =
      appTypeormManager.getRepository(InteractionsTable);
  }

  public async getStatsDomifaAdminDashboard(): Promise<AdminStructureStatsData> {
    const structures = await structureRepository.findMany({});

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

    const usagersDocumentsCount = await usagerRepository.countDocuments();
    const usagersCountByStatutMap = await this.getUsagersCountByStatutMap();
    const usagersCountByLanguage = await this.getUsagersCountByLanguage();
    const structuresCountBySmsEnabled = await this.getStructuresWithSms();

    const structuresCount = await structureRepository.count();

    const stats: AdminStructureStatsData = {
      // structures,
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
      usagersCountByLanguage,
    };

    return stats;
  }
  public async getAdminStructuresListData(): Promise<AdminStructureListData> {
    const structures = await structureRepository.findMany({});

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

  // TODO: ajouter la région
  public async getStructuresByType(region?: string): Promise<
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
    return structureRepository.count({
      where: `sms->>'enabledByStructure' = 'true'`,
      logSql: true,
    });
  }

  public async getInteractionsCountByTypeMap(): Promise<{
    [statut: string]: number;
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
    };
  }

  public async getUsagersValideCountByStructure(): Promise<
    {
      structureId: number;
      count: number;
    }[]
  > {
    return usagerRepository.countBy({
      countBy: "structureId",
      where: typeOrmSearch<UsagerTable>(`decision->>'statut' = 'VALIDE'`),
      order: {
        count: "DESC",
        countBy: "ASC",
      },
    });
  }

  public async getUsersStructureCountByStructure(): Promise<
    {
      structureId: number;
      count: number;
    }[]
  > {
    return userStructureRepository.countBy({
      countBy: "structureId",
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
    return usagerRepository.countBy({
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
    const results = await appTypeormManager
      .getRepository(UsagerTable)
      .query(
        `select "structureId", sum(jsonb_array_length("ayantsDroits")) as count from usager u group by "structureId" `
      );

    return usagerRepository._parseCounts<UsagerTable, "structureId">(results, {
      label: "count",
    });
  }

  public async countStructures(): Promise<number> {
    return structureRepository.count();
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

  public async getUsagersCountByLanguage() {
    return usagerRepository.countBy({
      countBy: "langue",
      order: { count: "DESC", countBy: "ASC" },
      nullLabel: "NON_RENSEIGNE",
    });
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
  public async getStructuresCountByDepartement(regionId: string): Promise<
    {
      departement: string;
      count: number;
    }[]
  > {
    return structureRepository.countBy({
      countBy: "departement",
      countByAlias: "dep",
      where: {
        region: regionId,
      },
      order: {
        count: "DESC",
        countBy: "ASC",
      },
    });
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

  public async getStructuresCountByTypeMap(region?: string) {
    const structures: { [key: string]: number } = {};
    const result = await this.getStructuresByType(region);
    for (const structure of result) {
      structures[structure.structureType] = structure.count;
    }
    return structures;
  }

  public async getStatsDeploiementForExport() {
    const structuresAdmin: StructureAdmin[] =
      await structureRepository.findMany(
        {},
        {
          order: {
            createdAt: "ASC",
          },
        }
      );

    const structuresIds = structuresAdmin.map((s) => s.id);

    const usersStructureCountByStructure =
      await this.getUsersStructureCountByStructure();

    const usersStructureCountByStructureMap = this.reduceSumResults(
      structuresIds,
      usersStructureCountByStructure
    );

    const structuresModels: StatsDeploiementStructureExportModel[] =
      structuresAdmin.map((structure) => ({
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
    const docsCount = await usagerRepository.countDocuments();

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
    return stats;
  }

  public async totalInteractions(
    interactionType: InteractionType,
    structuresId?: number[]
  ): Promise<number> {
    {
      if (interactionType === "appel" || interactionType === "visite") {
        return this.interactionRepository.count({
          type: interactionType,
          event: "create",
        });
      }
      const whereCondition: Partial<InteractionsTable> = {
        type: interactionType,
        event: "create",
      };

      if (structuresId) {
        whereCondition.structureId = In(structuresId) as any;
      }

      return interactionRepository.aggregateAsNumber({
        alias: "interactions",
        expression: "SUM(interactions.nbCourrier)",
        resultAlias: "sum",
        where: whereCondition,
      });
    }
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

  public async countUsagersByMonth(regionId?: string) {
    const usagersByMonth = await usagerRepository.countUsagersByMonth(regionId);

    return this.formatStatsByMonth(usagersByMonth, "domicilies");
  }

  public async countInteractionsByMonth(
    regionId?: string,
    interactionType: InteractionType = "courrierOut"
  ) {
    const usagersByMonth = await interactionRepository.countInteractionsByMonth(
      regionId,
      interactionType
    );
    return this.formatStatsByMonth(usagersByMonth, "interactions");
  }

  private formatStatsByMonth(
    rawResults: {
      date: Date;
      count: string;
      ayantsdroits?: string;
    }[],
    elementToCount: "interactions" | "domicilies"
  ): StatsByMonth {
    const results = {
      "sept.": 0,
      "oct.": 0,
      "nov.": 0,
      "déc.": 0,
      "janv.": 0,
      "févr.": 0,
      mars: 0,
      "avr.": 0,
      mai: 0,
      juin: 0,
      "juil.": 0,
      août: 0,
    };

    for (const result of rawResults) {
      const monthKey = new Date(result.date).toLocaleString("fr-fr", {
        month: "short",
      });
      results[monthKey] =
        elementToCount === "domicilies"
          ? parseInt(result.count, 10) + parseInt(result.ayantsdroits, 10)
          : parseInt(result.count, 10);
    }

    const statsByMonth: StatsByMonth = Object.entries(results).map(
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

    sumToReduce.reduce(
      (acc, x) => {
        listOfStructures[x.structureId] = x.count;
        return acc;
      },
      {} as {
        [structureId: string]: number;
      }
    );

    return listOfStructures;
  }
}
