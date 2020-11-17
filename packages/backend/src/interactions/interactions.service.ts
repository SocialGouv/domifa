import { HttpException, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import { AppUser, UserProfile, AppAuthUser } from "../_common/model";

import { Repository, FindConditions, LessThan, MoreThan } from "typeorm";
import { InteractionsTable } from "./pg/InteractionsTable.typeorm";

import { InteractionDto } from "./interactions.dto";
import { Interactions } from "./model/interactions.type";
import { InteractionType } from "./InteractionType.type";
import { User } from "../users/user.interface";

import { appTypeormManager } from "../database/appTypeormManager.service";

@Injectable()
export class InteractionsService {
  private interactionRepository: Repository<InteractionsTable>;

  constructor(
    @Inject("USAGER_MODEL")
    private readonly usagerModel: Model<Usager>
  ) {
    this.interactionRepository = appTypeormManager.getRepository(
      InteractionsTable
    );
  }
  public async create(
    usager: Usager,
    user: UserProfile,
    interactionDto: InteractionDto
  ): Promise<Usager> {
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

    return this.usagerModel
      .findOneAndUpdate(
        { _id: usager._id },
        { $set: { lastInteraction: usager.lastInteraction } },
        { new: true }
      )
      .select("-docsPath -interactions")
      .exec();
  }

  public async find(
    usagerId: number,
    limit: number,
    user: Pick<AppUser, "structureId">
  ): Promise<any> {
    return this.interactionRepository.find({
      where: { structureId: user.structureId, usagerId },
      order: {
        dateInteraction: "DESC",
      },
      skip: 0,
      take: 30,
    });
  }

  public async findOne(
    usagerId: number,
    interactionId: string,
    user: Pick<AppUser, "structureId">
  ): Promise<Interactions | null> {
    const where: FindConditions<InteractionsTable> = {
      id: interactionId,
      structureId: user.structureId,
      usagerId,
    };
    return this.interactionRepository.findOne({ where });
  }

  public async deuxDerniersPassages(
    usagerId: number,
    user: AppAuthUser
  ): Promise<Interactions[] | [] | null> {
    return this.interactionRepository.find({
      where: {
        structureId: user.structureId,
        usagerId,
        type: ["courrierOut", "visite", "appel", "colisOut", "recommandeOut"],
      },

      order: {
        dateInteraction: "DESC",
      },
      skip: 0,
      take: 2,
    });
  }

  public async findLastInteraction(
    usagerId: number,
    dateInteraction: Date,
    typeInteraction: InteractionType,
    user: Pick<AppUser, "structureId">,
    isIn: string
  ): Promise<Interactions | null> {
    const dateQuery =
      isIn === "out" ? LessThan(dateInteraction) : MoreThan(dateInteraction);

    const where: FindConditions<InteractionsTable> = {
      structureId: user.structureId,
      usagerId,
      type: typeInteraction,
      dateInteraction: dateQuery,
    };
    return this.interactionRepository.findOne({
      where,
    });
  }

  public async delete(
    usagerId: number,
    interactionId: number,
    user: User
  ): Promise<any> {
    const retour = this.interactionRepository.delete({
      id: interactionId,
      structureId: user.structureId,
      usagerId,
    });

    if (!retour || retour === null) {
      throw new HttpException("CANNOT_DELETE_INTERACTION", 500);
    }
    return retour;
  }

  public async deleteByUsager(
    usagerId: number,
    structureId: number
  ): Promise<any> {
    return this.interactionRepository.delete({
      structureId,
      usagerId,
    });
  }

  public async deleteAll(structureId: number): Promise<any> {
    return this.interactionRepository.delete({
      structureId,
    });
  }

  public async totalInteraction(
    structureId: number,
    usagerId: number,
    interactionType: InteractionType
  ): Promise<number> {
    if (interactionType === "appel" || interactionType === "visite") {
      return this.interactionRepository.count({
        structureId,
        usagerId,
        type: interactionType,
      });
    } else {
      const search = await this.interactionRepository
        .createQueryBuilder("interactions")
        .select("SUM(interactions.nbCourrier)", "sum")
        .where({ structureId, usagerId, type: interactionType })
        .groupBy("interactions.type")
        .getRawOne();
      return typeof search !== "undefined" ? search.sum : 0;
    }
  }
}
