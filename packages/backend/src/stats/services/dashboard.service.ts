import { Injectable } from "@nestjs/common";
import moment = require("moment");
import { Repository } from "typeorm";
import {
  appTypeormManager,
  interactionRepository,
  InteractionsTable,
  postgresQueryBuilder,
  structureRepository,
  StructureTable,
  typeOrmSearch,
  usagerRepository,
  UsagerTable,
  usersRepository,
} from "../../database";
import { StatsDeploiementExportModel } from "../../excel/export-stats-deploiement";
import { StatsDeploiementStructureExportModel } from "../../excel/export-stats-deploiement/StatsDeploiementStructureExportModel.type";
import {
  DashboardStats,
  StatsByMonth,
  StructureType,
  UsagerDecisionStatut,
} from "../../_common/model";
import { InteractionType } from "../../_common/model/interaction";
import { StructureAdmin } from "../../_common/model/structure/StructureAdmin.type";

@Injectable()
export class DashboardService {
  private interactionRepository: Repository<InteractionsTable>;

  constructor() {
    this.interactionRepository =
      appTypeormManager.getRepository(InteractionsTable);
  }

  public async getStatsDomifaAdminDashboard(): Promise<DashboardStats> {
    const structures = await this.getStructuresForDashboard();

    const {
      usagersValidCountByStructureMap,
      usagersAllCountByStructureMap,
      usagersAyantsDroitsCountByStructureMap,
    } = await this.getUsagersCountByStructureMaps(structures);

    const structuresCountByRegion = await this.getStructuresCountByRegion();

    const structuresCountByTypeMap = await this.getStructuresCountByTypeMap();

    const usersCount = await this.countUsers();

    const interactionsCountByTypeMap =
      await this.getInteractionsCountByTypeMap();

    const usagersDocumentsCount = await usagerRepository.countDocuments();
    const usagersCountByStatutMap = await this.getUsagersCountByStatutMap();
    const usagersCountByLanguage = await this.getUsagersCountByLanguage();
    const structuresCountBySmsEnabled = await this.getStructuresWithSms();

    const stats: DashboardStats = {
      structures,
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

  private async getStructuresForDashboard(): Promise<
    (StructureAdmin & {
      usersCount?: number; // dashboard only
    })[]
  > {
    const structures = await structureRepository.findMany({});
    for (const structure of structures) {
      (
        structure as unknown as StructureAdmin & {
          usersCount?: number; // dashboard only
        }
      ).usersCount = await usersRepository.count({
        where: {
          structureId: structure.id,
        },
      });
    }
    return structures;
  }

  // TODO: ajouter la région
  public async getStructuresByType(): Promise<
    {
      structureType: StructureType;
      count: number;
    }[]
  > {
    return structureRepository.countBy({
      countBy: "structureType",
      order: {
        count: "DESC",
        countBy: "ASC",
      },
    });
  }

  public async getStructuresWithSms(): Promise<number> {
    return appTypeormManager
      .getRepository(StructureTable)
      .query(
        `SELECT COUNT(*)  from structure where sms->>'enabledByStructure' = 'true' `
      );
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
      sum: string;
    }[]
  > {
    return appTypeormManager
      .getRepository(UsagerTable)
      .query(
        `select "structureId", sum(jsonb_array_length("ayantsDroits")) as count from usager u group by "structureId" `
      );
  }

  public async countUsers(regionId?: string): Promise<number> {
    return usersRepository.count();
  }

  public async countStructures(regionId?: string): Promise<number> {
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

  public async getStructuresCountByTypeMap() {
    const structures: { [key: string]: number } = {};
    const result = await this.getStructuresByType();
    for (const structure of result) {
      structures[structure.structureType] = structure.count;
    }
    return structures;
  }

  public async getStatsDeploiement() {
    const structuresModels: StatsDeploiementStructureExportModel[] =
      await this.getStatsDeploiementStructures();

    const structures = await this.getStructuresForDashboard();

    const {
      usagersValidCountByStructureMap,
      usagersAllCountByStructureMap,
      usagersAyantsDroitsCountByStructureMap,
    } = await this.getUsagersCountByStructureMaps(structures);

    const usagersCountByStatut = await this.getUsagersCountByStatutMap();

    const structuresCountByRegion = await this.getStructuresCountByRegion();

    const structuresCountByType = await this.getStructuresCountByTypeMap();
    const usersCount = await usersRepository.count();
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

  private async getStatsDeploiementStructures() {
    const structures: StructureAdmin[] = await structureRepository.findMany(
      {},
      {
        order: {
          createdAt: "ASC",
        },
      }
    );

    const structuresModels: StatsDeploiementStructureExportModel[] = [];

    for (const structure of structures) {
      const usersCount = await usersRepository.count({
        where: {
          structureId: structure.id,
        },
      });
      const structureModel: StatsDeploiementStructureExportModel = {
        structure,
        usersCount,
      };
      structuresModels.push(structureModel);
    }
    return structuresModels;
  }

  public async totalInteractions(
    interactionType: InteractionType
  ): Promise<number> {
    {
      if (interactionType === "appel" || interactionType === "visite") {
        return this.interactionRepository.count({
          type: interactionType,
          event: "create",
        });
      } else {
        const search = await this.interactionRepository
          .createQueryBuilder("interactions")
          .select("SUM(interactions.nbCourrier)", "sum")
          .where({ type: interactionType, event: "create" })
          .groupBy("interactions.type")
          .getRawOne();

        return typeof search !== "undefined" ? parseInt(search.sum, 10) : 0;
      }
    }
  }

  private async getUsagersCountByStructureMaps(structures) {
    const usagersValidCountByStructure =
      await this.getUsagersValideCountByStructure();

    const usagersAllCountByStructure =
      await this.getUsagersAllCountByStructure();

    const usagersAyantsDroitsCountByStructure =
      await this.getUsagersAyantsDroitsCountByStructure();

    const usagersValidCountByStructureMap = this.reduceSumResults(
      structures,
      usagersValidCountByStructure
    );

    const usagersAyantsDroitsCountByStructureMap = this.reduceSumResults(
      structures,
      usagersAyantsDroitsCountByStructure
    );

    const usagersAllCountByStructureMap = this.reduceSumResults(
      structures,
      usagersAllCountByStructure
    );

    return {
      usagersValidCountByStructureMap,
      usagersAllCountByStructureMap,
      usagersAyantsDroitsCountByStructureMap,
    };
  }

  public async getUsagersByMonth(regionId?: string) {
    const startDate = postgresQueryBuilder.formatPostgresDate(
      moment().subtract(1, "year").add(1, "month").startOf("month").toDate()
    );

    const where = [startDate];

    let query = `select date_trunc('month', "createdAt") as date,
        COUNT(uuid) AS count
        FROM usager u
        WHERE "createdAt" > $1 `;

    if (regionId) {
      query =
        query +
        ` and "structureId" in (select id from "structure" s where  "region"=$2)`;

      where.push(regionId);
    }

    query = query + ` GROUP BY 1`;

    const rawResults = await (
      await usagerRepository.typeorm()
    ).query(query, where);

    return this.formatStatsByMonth(rawResults);
  }

  public async getInteractionsByMonth(
    interactionType: InteractionType = "courrierOut",
    regionId?: string
  ) {
    const startDate = postgresQueryBuilder.formatPostgresDate(
      moment().subtract(1, "year").add(1, "month").startOf("month").toDate()
    );

    const where: string[] = [startDate, interactionType];

    let query = `select date_trunc('month', "dateInteraction") as date,
        SUM("nbCourrier") as count
        FROM interactions i
        WHERE "dateInteraction" > $1 AND "type" = $2`;

    if (regionId) {
      query =
        query +
        ` and "structureId" in (select id from "structure" s where  "region"=$3)`;

      where.push(regionId);
    }

    query = query + ` GROUP BY 1`;

    const rawResults = await (
      await interactionRepository.typeorm()
    ).query(query, where);

    return this.formatStatsByMonth(rawResults);
  }

  private formatStatsByMonth(rawResults: any): StatsByMonth {
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
      results[monthKey] = result.count;
    }

    const statsByMonth: StatsByMonth = Object.entries(results).map(
      ([key, value]) => ({ name: key, value })
    );

    return statsByMonth;
  }

  public reduceSumResults(structures, sumToReduce) {
    const listOfStructures: {
      [key in string]?: number;
    } = structures.reduce(
      (acc, x) => {
        acc[x.id] = 0;
        return acc;
      },
      {} as {
        [structureId: string]: number;
      }
    );

    sumToReduce.reduce(
      (acc, x) => {
        listOfStructures[x.structureId] = parseInt(x.count, 10);
        return acc;
      },
      {} as {
        [structureId: string]: number;
      }
    );

    return listOfStructures;
  }
}
