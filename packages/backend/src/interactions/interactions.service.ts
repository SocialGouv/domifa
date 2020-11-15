import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import { Repository } from "typeorm";
import { InteractionsTable } from "./pg/InteractionsTable.typeorm";
import { InteractionDocument } from "./interactions.interface";
import { Usager } from "../usagers/interfaces/usagers";
import { appTypeormManager } from "../database/appTypeormManager.service";
import { InteractionDto } from "./interactions.dto";
import { Interactions } from "./model";
import { InteractionType } from "./InteractionType.type";
import { User } from "../users/user.interface";

@Injectable()
export class InteractionsService {
  private interactionRepository: Repository<InteractionsTable>;

  constructor(
    @Inject("INTERACTION_MODEL")
    private readonly interactionModel: Model<InteractionDocument>,
    @Inject("USAGER_MODEL")
    private readonly usagerModel: Model<Usager>
  ) {
    this.interactionRepository = appTypeormManager.getRepository(
      InteractionsTable
    );
  }
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
      interactionDto.nbCourrier = usager.lastInteraction[inType] || 1;

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

    interactionDto.structureId = user.structureId;
    interactionDto.usagerId = usager.id;
    interactionDto.userId = user.id;
    interactionDto.userName = user.prenom + " " + user.nom;

    const createdInteraction: Interactions = new InteractionsTable(
      interactionDto
    );

    await this.interactionRepository.insert(createdInteraction);
    /*
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
      */
  }
  public async find(usagerId: number, limit: number, user: User): Promise<any> {
    return this.interactionModel
      .find({
        structureId: user.structureId,
        usagerId,
      })
      .limit(30)
      .sort({ dateInteraction: -1 })
      .lean()
      .exec();
  }

  public async findOne(
    usagerId: number,
    interactionId: string,
    user: User
  ): Promise<InteractionDocument | null> {
    return this.interactionModel
      .findOne({
        _id: interactionId,
        structureId: user.structureId,
        usagerId,
      })
      .exec();
  }

  public async deuxDerniersPassages(
    usagerId: number,
    user: User
  ): Promise<InteractionDocument[] | [] | null> {
    return this.interactionModel
      .find({
        structureId: user.structureId,
        type: {
          $in: ["courrierOut", "visite", "appel", "colisOut", "recommandeOut"],
        },
        usagerId,
      })
      .sort({ dateInteraction: -1 })
      .limit(2)
      .exec();
  }

  public async findLastInteraction(
    usagerId: number,
    dateInteraction: Date,
    typeInteraction: InteractionType,
    user: User,
    isIn: string
  ): Promise<InteractionDocument | null> {
    const dateQuery =
      isIn === "out" ? { $lte: dateInteraction } : { $gte: dateInteraction };

    return this.interactionModel
      .findOne({
        structureId: user.structureId,
        usagerId,
        type: typeInteraction,
        dateInteraction: dateQuery,
      })
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

    if (!retour || retour === null) {
      throw new HttpException("CANNOT_DELETE_INTERACTION", 500);
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

  public async totalInteraction(
    structureId: number,
    usagerId: number,
    interactionType: InteractionType
  ): Promise<number> {
    if (interactionType === "appel" || interactionType === "visite") {
      return this.interactionModel.countDocuments({
        structureId,
        usagerId,
        type: interactionType,
      });
    } else {
      const search = {
        $match: {
          structureId,
          usagerId,
          interactionType,
        },
      };

      const groupBy = { $group: { _id: null, total: { $sum: "$nbCourrier" } } };
      const response = await this.interactionModel
        .aggregate([search, groupBy])
        .exec();

      if (response.length) {
        return typeof response[0].total !== "undefined" ? response[0].total : 0;
      }
      return 0;
    }
  }
}
