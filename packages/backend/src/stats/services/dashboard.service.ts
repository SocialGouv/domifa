import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Structure } from "../../structures/structure-interface";

import { Interaction } from "../../interactions/interactions.interface";

import { StructuresService } from "../../structures/structures.service";
import { Usager } from "../../usagers/interfaces/usagers";

import { StatsDocument } from "../stats.interface";
import { User } from "../../users/user.interface";

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
    @Inject("STATS_MODEL")
    private statsModel: Model<StatsDocument>,
    @Inject("USAGER_MODEL")
    private usagerModel: Model<Usager>,
    @Inject("USER_MODEL")
    private userModel: Model<User>,
    @Inject("INTERACTION_MODEL")
    private interactionModel: Model<Interaction>,
    private readonly structureService: StructuresService
  ) {
    this.today = new Date();
    this.demain = new Date();
    this.debutAnnee = new Date();
    this.finAnnee = new Date();
    this.dateMajorite = new Date();
  }

  // TODO : Search options - tri par élément
  public async getStructures(): Promise<Structure[]> {
    return this.structureModel
      .find()
      .select("-token")
      .sort("+createdAt")
      .exec();
  }

  public async getStructuresByType(): Promise<any> {
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

  public async getInteractions() {
    return this.interactionModel
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
  }

  public async getUsagersValide() {
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
}
