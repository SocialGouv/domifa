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
    const len = interactionDto.type.length;
    const interactionOut = interactionDto.type.substring(len - 3) === "Out";
    const interactionIn = interactionDto.type.substring(len - 2) === "In";

    if (interactionIn) {
      const count =
        typeof interactionDto.nbCourrier !== "undefined"
          ? interactionDto.nbCourrier
          : 1;

      usager.lastInteraction[interactionDto.type] =
        usager.lastInteraction[interactionDto.type] + count;

      usager.lastInteraction.enAttente = true;
    } else if (interactionOut) {
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

      const inType = interactionDto.type.substring(0, len - 3) + "In";
      interactionDto.nbCourrier = usager.lastInteraction[inType];

      usager.lastInteraction[inType] = 0;

      usager.lastInteraction.enAttente =
        usager.lastInteraction.courrierIn > 0 ||
        usager.lastInteraction.colisIn > 0 ||
        usager.lastInteraction.recommandeIn > 0;
    } else {
      interactionDto.nbCourrier = 0;
    }

    if (
      (interactionOut ||
        interactionDto.type === "visite" ||
        interactionDto.type === "appel") &&
      !interactionDto.procuration
    ) {
      usager.lastInteraction.dateInteraction = new Date();
    }

    const createdInteraction = new this.interactionModel(interactionDto);

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
    const retour = this.interactionModel
      .deleteOne({
        _id: interactionId,
        structureId: user.structureId,
        usagerId,
      })
      .exec();

    if (retour !== null) {
      throw new HttpException("CANNOT_DELETE_USAGER", 500);
    }
    return retour;
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
