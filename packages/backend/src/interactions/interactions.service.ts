import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Usager } from "../usagers/interfaces/usagers";
import { UsagersService } from "../usagers/services/usagers.service";
import { User } from "../users/user.interface";
import { InteractionDto } from "./interactions.dto";
import { Interaction } from "./interactions.interface";

@Injectable()
export class InteractionsService {
  constructor(
    @Inject("INTERACTION_MODEL")
    private readonly interactionModel: Model<Interaction>,
    @Inject("USAGER_MODEL")
    private readonly usagerModel: Model<Usager>,
    private readonly usagersService: UsagersService
  ) {}

  public async create(
    usager: Usager,
    user: User,
    interactionDto: InteractionDto
  ): Promise<any> {
    const createdInteraction = new this.interactionModel(interactionDto);

    if (interactionDto.nbCourrier) {
      usager.lastInteraction.nbCourrier =
        usager.lastInteraction.nbCourrier + interactionDto.nbCourrier;
    }

    if (
      interactionDto.type === "courrierIn" &&
      typeof interactionDto.nbCourrier === "undefined"
    ) {
      usager.lastInteraction.nbCourrier = usager.lastInteraction.nbCourrier + 1;
    }

    if (
      interactionDto.type === "courrierOut" ||
      interactionDto.type === "recommandeOut"
    ) {
      if (interactionDto.procuration) {
        interactionDto.content =
          "Courrier remis au mandataire : " +
          usager.options.procuration.prenom +
          " " +
          usager.options.procuration.nom.toUpperCase();
      } else if (interactionDto.transfert) {
        interactionDto.content =
          "Courrier transféré à : " +
          usager.options.transfert.nom +
          " - " +
          usager.options.transfert.adresse.toUpperCase();
      }

      usager.lastInteraction.nbCourrier = 0;
    }

    if (
      (interactionDto.type === "courrierOut" ||
        interactionDto.type === "recommandeOut" ||
        interactionDto.type === "visite" ||
        interactionDto.type === "appel") &&
      !interactionDto.procuration
    ) {
      usager.lastInteraction.dateInteraction = new Date();
    }

    createdInteraction.content = interactionDto.content;
    createdInteraction.dateInteraction = new Date();
    createdInteraction.structureId = user.structureId;
    createdInteraction.usagerId = usager.id;
    createdInteraction.userId = user.id;
    createdInteraction.userName = user.prenom + " " + user.nom;

    const savedInteraction = await createdInteraction.save();
    usager.interactions.push(savedInteraction);

    return this.usagerModel
      .findOneAndUpdate(
        {
          _id: usager._id,
        },
        {
          $push: { interaction: savedInteraction },
          $set: {
            lastInteraction: usager.lastInteraction,
          },
        },
        {
          new: true,
        }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async find(usagerId: number, limit: number, user: User): Promise<any> {
    return this.interactionModel
      .find({
        structureId: user.structureId,
        usagerId,
      })
      .limit(8)
      .sort({ dateInteraction: -1 })
      .lean()
      .exec();
  }

  public async delete(
    usagerId: number,
    interactionId: string,
    user: User
  ): Promise<any> {
    return this.interactionModel
      .deleteOne({
        _id: interactionId,
        structureId: user.structureId,
        usagerId,
      })
      .exec();
  }

  public async deleteByUsager(
    usagerId: number,
    structureId: number
  ): Promise<any> {
    return this.interactionModel
      .deleteMany({
        structureId,
        usagerId,
      })
      .exec();
  }

  public async deleteAll(structureId: number): Promise<any> {
    return this.interactionModel.deleteMany({ structureId }).exec();
  }

  public async stats(structureId?: number) {
    const query = structureId ? { structureId: { $eq: structureId } } : {};

    return this.interactionModel
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: { structureId: "$structureId", type: "$type" },
            total: { $sum: 1 },
            types: { $push: "$type" },
          },
        },
        {
          $group: {
            _id: { structureId: "$_id.structureId" },
            type: { $addToSet: { type: "$_id.type", sum: "$total" } },
          },
        },
      ])
      .exec();
  }

  public async statsAll() {
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
}
