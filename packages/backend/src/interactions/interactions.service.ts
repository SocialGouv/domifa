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
      usager.lastInteraction.nbCourrier = 0;
    }

    if (
      interactionDto.type === "courrierOut" ||
      interactionDto.type === "recommandeOut" ||
      interactionDto.type === "visite" ||
      interactionDto.type === "appel"
    ) {
      usager.lastInteraction.dateInteraction = new Date();
    }

    createdInteraction.userName = user.prenom + " " + user.nom;
    createdInteraction.userId = user.id;
    createdInteraction.usagerId = usager.id;
    createdInteraction.structureId = user.structureId;

    createdInteraction.dateInteraction = new Date();

    const savedInteraction = await createdInteraction.save();
    usager.interactions.push(savedInteraction);

    return this.usagerModel
      .findOneAndUpdate(
        {
          id: usager.id,
          structureId: user.structureId
        },
        {
          $push: { interaction: savedInteraction },
          $set: {
            lastInteraction: usager.lastInteraction
          }
        },
        {
          new: true
        }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async find(usagerId: number, limit: number, user: User): Promise<any> {
    return this.interactionModel
      .find({
        structureId: user.structureId,
        usagerId
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
        usagerId
      })
      .exec();
  }

  public async deleteAll(usagerId: number, structureId: number): Promise<any> {
    return this.interactionModel
      .deleteMany({
        structureId,
        usagerId
      })
      .exec();
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
            types: { $push: "$type" }
          }
        },
        {
          $group: {
            _id: { structureId: "$_id.structureId" },
            type: { $addToSet: { type: "$_id.type", sum: "$total" } }
          }
        }
      ])
      .exec();
  }
}
