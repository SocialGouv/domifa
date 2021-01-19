import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Repository } from "typeorm";
import {
  appTypeormManager,
  InteractionsTable,
  usersRepository,
} from "../../database";
import { StatsDeploiementExportModel } from "../../excel/export-stats-deploiement";
import { StatsDeploiementStructureExportModel } from "../../excel/export-stats-deploiement/StatsDeploiementStructureExportModel.type";
import { InteractionType } from "../../_common/model/interaction/InteractionType.type";
import { Structure } from "../../structures/structure-interface";
import { Usager } from "../../usagers/interfaces/usagers";
import { StructureType } from "../../_common/model";
import { StatsGeneratorService } from "./stats-generator.service";

@Injectable()
export class DashboardService {
  private interactionRepository: Repository<InteractionsTable>;

  constructor(
    @Inject("STRUCTURE_MODEL")
    private structureModel: Model<Structure>,
    @Inject("USAGER_MODEL")
    private usagerModel: Model<Usager>,
    private statsGeneratorService: StatsGeneratorService
  ) {
    this.interactionRepository = appTypeormManager.getRepository(
      InteractionsTable
    );
  }

  public async getStructures(
    options: {
      sort?: any;
    } = {}
  ): Promise<Structure[]> {
    let query = this.structureModel
      .find()
      .collation({ locale: "en", strength: 2 })
      .select("-token -users +stats");
    if (options.sort) {
      query = query.sort(options.sort);
    }

    return query.exec();
  }

  public async getStructuresForDashboard(): Promise<Structure[]> {
    const structures = await this.getStructures();
    for (const structure of structures) {
      structure.usersCount = await usersRepository.count({
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
    return this.structureModel.aggregate([
      {
        $project: {
          _id: "$_id",
          ___group: { structureType: "$structureType" },
        },
      },
      { $group: { _id: "$___group", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: false,
          structureType: "$_id.structureType",
          count: true,
        },
      },
      { $sort: { count: -1, structureType: 1 } },
    ]);
  }

  public async getInteractionsCountByType(): Promise<{
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
    return this.structureModel
      .aggregate([
        { $project: { _id: "$_id", ___group: { region: "$region" } } },
        { $group: { _id: "$___group", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: false, region: "$_id.region", count: true } },
        { $sort: { count: -1, region: 1 } },
      ])
      .exec();
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
    const structures: Structure[] = await this.getStructures({
      sort: {
        createdAt: 1,
      },
    });

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
