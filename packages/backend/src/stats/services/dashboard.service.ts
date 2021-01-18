import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Repository } from "typeorm";
import {
  appTypeormManager,
  InteractionsTable,
  structureRepository,
  usersRepository,
} from "../../database";
import { StatsDeploiementExportModel } from "../../excel/export-stats-deploiement";
import { StatsDeploiementStructureExportModel } from "../../excel/export-stats-deploiement/StatsDeploiementStructureExportModel.type";
import { InteractionType } from "../../interactions/InteractionType.type";
import { Usager } from "../../usagers/interfaces/usagers";
import { StructureType } from "../../_common/model";
import { StructureAdmin } from "../../_common/model/structure/StructureAdmin.type";
import { StatsGeneratorService } from "./stats-generator.service";

@Injectable()
export class DashboardService {
  public debutAnnee: Date;
  public finAnnee: Date;
  public dateMajorite: Date;
  public today: Date;
  public demain: Date;

  private interactionRepository: Repository<InteractionsTable>;

  constructor(
    @Inject("USAGER_MODEL")
    private usagerModel: Model<Usager>,
    private statsGeneratorService: StatsGeneratorService
  ) {
    this.today = new Date();
    this.demain = new Date();
    this.debutAnnee = new Date();
    this.finAnnee = new Date();
    this.dateMajorite = new Date();

    this.interactionRepository = appTypeormManager.getRepository(
      InteractionsTable
    );
  }

  public async getStructuresForDashboard(): Promise<
    (StructureAdmin & {
      usersCount?: number; // dashboard only
    })[]
  > {
    const structures = await structureRepository.findMany({});
    for (const structure of structures) {
      ((structure as unknown) as StructureAdmin & {
        usersCount?: number; // dashboard only
      }).usersCount = await usersRepository.count({
        structureId: structure.id,
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

  public async getInteractionsCountByType(): Promise<{
    [statut: string]: number;
  }> {
    return {
      courrierIn: await this._totalInteractions("courrierIn"),
      courrierOut: await this._totalInteractions("courrierOut"),
      recommandeIn: await this._totalInteractions("recommandeIn"),
      recommandeOut: await this._totalInteractions("recommandeOut"),
      colisIn: await this._totalInteractions("colisIn"),
      colisOut: await this._totalInteractions("colisOut"),
      appel: await this._totalInteractions("appel"),
      visite: await this._totalInteractions("visite"),
      npai: await this._totalInteractions("npai"),
    };
  }

  public async getUsagersValide(): Promise<
    {
      structureId: string;
      count: number;
    }[]
  > {
    return this.usagerModel
      .aggregate([
        {
          $project: {
            structureId: "$structureId",
            decision___statut: "$decision.statut",
          },
        },
        { $match: { decision___statut: { $eq: "VALIDE" } } },
        {
          $project: { _id: "$_id", ___group: { structureId: "$structureId" } },
        },
        { $group: { _id: "$___group", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: false,
            structureId: "$_id.structureId",
            count: true,
          },
        },
        { $sort: { count: -1, structureId: 1 } },
      ])
      .exec();
  }

  public async getUsagersByStructure(structureId?: number) {
    const query = structureId ? { structureId: { $eq: structureId } } : {};

    return this.usagerModel
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: { structureId: "$structureId", statut: "$decision.statut" },
            statuts: { $push: "$decision.statut" },
            total: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: { structureId: "$_id.structureId" },
            statut: { $addToSet: { statut: "$_id.statut", sum: "$total" } },
          },
        },
      ])
      .exec();
  }

  public async getUsagers() {
    return this.usagerModel
      .aggregate([
        { $match: {} },
        {
          $group: {
            _id: { statut: "$decision.statut" },
            statuts: { $push: "$decision.statut" },
            total: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: { statut: "$_id.statut" },
            sum: { $addToSet: "$total" },
          },
        },
      ])
      .exec();
  }

  public async getLanguages() {
    return this.usagerModel
      .aggregate([
        { $match: {} },
        {
          $group: {
            _id: { langue: "$langue" },
            langues: { $push: "$langue" },
            total: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: { langue: "$_id.langue" },
            sum: { $addToSet: "$total" },
          },
        },
      ])

      .exec();
  }

  public async getRegions(): Promise<
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

  public async getUsagersCountByStatut() {
    const ayantsDroits = await this.statsGeneratorService.countAyantsDroits();
    const result = await this.getUsagers();

    const usagers: { [key: string]: number } = {};
    let total = 0;

    usagers.AYANTS_DROITS = ayantsDroits[0].count;
    for (const usager of result) {
      usagers[usager._id.statut] = usager.sum[0];
      total += usager.sum[0];
    }
    usagers.TOUS = total + usagers.AYANTS_DROITS;
    return usagers;
  }

  public async getUsagersCountByStructureId() {
    const result = await this.getUsagersValide();
    const usagersCountByStructureId: { [key: string]: number } = {};

    for (const usager of result) {
      usagersCountByStructureId[usager.structureId] = usager.count;
    }
    return usagersCountByStructureId;
  }

  public async getDocsCount() {
    const docs = await this.statsGeneratorService.countDocs();
    return docs[0].count;
  }

  public async getStructuresCountByType() {
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
    const usagersCountByStatut = await this.getUsagersCountByStatut();

    const structuresCountByRegion = await this.getRegions();

    const structuresCountByType = await this.getStructuresCountByType();
    const usersCount = await usersRepository.count();
    const docsCount = await this.getDocsCount();

    const interactionsCountByStatut = await this.getInteractionsCountByType();

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
        structureId: structure.id,
      });
      const structureModel: StatsDeploiementStructureExportModel = {
        structure,
        usersCount,
      };
      structuresModels.push(structureModel);
    }
    return structuresModels;
  }

  private async _totalInteractions(
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
