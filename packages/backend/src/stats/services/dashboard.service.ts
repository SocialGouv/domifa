import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { StructureType } from "../../structures/StructureType.type";
import { StatsDeploiementExportModel } from "../../excel/export-stats-deploiement";
import { InteractionDocument } from "../../interactions/interactions.interface";
import { Structure } from "../../structures/structure-interface";

import { Usager } from "../../usagers/interfaces/usagers";
import { User } from "../../users/user.interface";
import { StatsGeneratorService } from "./stats-generator.service";

@Injectable()
export class DashboardService {
  public debutAnnee: Date;
  public finAnnee: Date;
  public dateMajorite: Date;
  public today: Date;
  public demain: Date;

  constructor(
    @Inject("STRUCTURE_MODEL")
    private structureModel: Model<Structure>,
    @Inject("USAGER_MODEL")
    private usagerModel: Model<Usager>,
    @Inject("USER_MODEL")
    private userModel: Model<User>,
    @Inject("INTERACTION_MODEL")
    private interactionModel: Model<InteractionDocument>,
    private statsGeneratorService: StatsGeneratorService
  ) {
    this.today = new Date();
    this.demain = new Date();
    this.debutAnnee = new Date();
    this.finAnnee = new Date();
    this.dateMajorite = new Date();
  }

  public async getStructures(
    options: {
      sort?: any;
    } = {}
  ): Promise<Structure[]> {
    let query = this.structureModel
      .find()
      .collation({ locale: "en", strength: 2 })
      .select("-token +stats")
      .populate("users", "verified");
    if (options.sort) {
      query = query.sort(options.sort);
    }
    return query.exec();
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
    const res = await this.interactionModel
      .aggregate([
        { $match: {} },
        {
          $group: {
            _id: { statut: "$type" },
            statuts: { $push: "$type" },
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

    return res.reduce((acc, stat) => {
      acc[stat._id.statut] = stat.sum[0];
      return acc;
    }, {});
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

  public async getUsers() {
    return this.userModel.countDocuments().exec();
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
    const structures: Structure[] = await this.getStructures({
      sort: {
        createdAt: 1,
      },
    });

    const usagersCountByStructureId = await this.getUsagersCountByStructureId();
    const usagersCountByStatut = await this.getUsagersCountByStatut();

    const structuresCountByRegion = await this.getRegions();

    const structuresCountByType = await this.getStructuresCountByType();
    const usersCount = await this.getUsers();
    const docsCount = await this.getDocsCount();
    const interactionsCountByStatut = await this.getInteractionsCountByType();

    const stats: StatsDeploiementExportModel = {
      exportDate: new Date(),
      structures,
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
}
