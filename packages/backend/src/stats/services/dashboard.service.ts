import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import {
  appTypeormManager,
  InteractionsTable,
  structureRepository,
  typeOrmSearch,
  UsagerDecisionStatut,
  usagerRepository,
  UsagerTable,
  usersRepository,
} from "../../database";
import { StatsDeploiementExportModel } from "../../excel/export-stats-deploiement";
import { StatsDeploiementStructureExportModel } from "../../excel/export-stats-deploiement/StatsDeploiementStructureExportModel.type";
import { DashboardStats, StructureType } from "../../_common/model";
import { InteractionType } from "../../_common/model/interaction";
import { StructureAdmin } from "../../_common/model/structure/StructureAdmin.type";
import { StatsGeneratorService } from "./stats-generator.service";

@Injectable()
export class DashboardService {
  private interactionRepository: Repository<InteractionsTable>;

  constructor(private statsGeneratorService: StatsGeneratorService) {
    this.interactionRepository = appTypeormManager.getRepository(
      InteractionsTable
    );
  }

  public async getStatsDomifaAdminDashboard(): Promise<DashboardStats> {
    const structures = await this.getStructuresForDashboard();

    const usagersValidCountByStructure = await this.getUsagersValideCountByStructure();
    const usagersValidCountByStructureMap = usagersValidCountByStructure.reduce(
      (acc, x) => {
        acc[x.structureId] = x.count;
        return acc;
      },
      {} as {
        [structureId: string]: number;
      }
    );

    const structuresCountByRegion = await this.getStructuresCountByRegion();

    const structuresCountByTypeMap = await this.getStructuresCountByTypeMap();

    const usersCount = await usersRepository.count();

    const interactionsCountByTypeMap = await this.getInteractionsCountByTypeMap();

    const usagersDocumentsCount = await usagerRepository.countDocuments();
    const usagersCountByStatutMap = await this.getUsagersCountByStatutMap();
    const usagersCountByLanguage = await this.getUsagersCountByLanguage();

    const stats: DashboardStats = {
      structures,
      usagersValidCountByStructureMap,
      structuresCountByRegion,
      structuresCountByTypeMap,
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
      ((structure as unknown) as StructureAdmin & {
        usersCount?: number; // dashboard only
      }).usersCount = await usersRepository.count({
        where: {
          structureId: structure.id,
        },
      });
    }
    return structures;
  }

  public async getStructuresByType(): Promise<
    {
      structureType: StructureType;
      count: number;
    }[]
  > {
    return await structureRepository.countBy({
      countBy: "structureType",
      order: {
        count: "DESC",
        countBy: "ASC",
      },
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
    return await usagerRepository.countBy({
      countBy: "structureId",
      where: typeOrmSearch<UsagerTable>(`decision->>'statut' = 'VALIDE'`),
      order: {
        count: "DESC",
        countBy: "ASC",
      },
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
    return await structureRepository.countBy({
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

  public async getUsagersCountByStructureId() {
    const result = await this.getUsagersValideCountByStructure();
    const usagersCountByStructureId: { [key: string]: number } = {};

    for (const usager of result) {
      usagersCountByStructureId[usager.structureId] = usager.count;
    }
    return usagersCountByStructureId;
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
    const structuresModels: StatsDeploiementStructureExportModel[] = await this.getStatsDeploiementStructures();

    const usagersCountByStructureId = await this.getUsagersCountByStructureId();
    const usagersCountByStatut = await this.getUsagersCountByStatutMap();

    const structuresCountByRegion = await this.getStructuresCountByRegion();

    const structuresCountByType = await this.getStructuresCountByTypeMap();
    const usersCount = await usersRepository.count();
    const docsCount = await usagerRepository.countDocuments();

    const interactionsCountByStatut = await this.getInteractionsCountByTypeMap();

    const stats: StatsDeploiementExportModel = {
      exportDate: new Date(),
      structures: structuresModels,
      usagersCountByStructureId,
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
        });
      } else {
        const search = await this.interactionRepository
          .createQueryBuilder("interactions")
          .select("SUM(interactions.nbCourrier)", "sum")
          .where({ type: interactionType })
          .groupBy("interactions.type")
          .getRawOne();

        return typeof search !== "undefined" ? search.sum : 0;
      }
    }
  }
}
