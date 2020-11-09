import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { StructureStatsTable } from "../../stats/pg/StructureStatsTable.typeorm";
import { appTypeormManager } from "../../database/appTypeormManager.service";
import { Usager } from "../../usagers/interfaces/usagers";

import { InteractionDto } from "../interactions.dto";
import { Interaction } from "../interactions.interface";
import { InteractionType } from "../InteractionType.type";
import { Model } from "mongoose";
import { Interactions } from "../model";
import { User } from "../../users/user.interface";

@Injectable()
export class InteractionsService {
  private structureStatsRepository: Repository<StructureStatsTable>;

  constructor(
    @Inject("USAGER_MODEL")
    private readonly usagerModel: Model<Usager>
  ) {
    this.structureStatsRepository = appTypeormManager.getRepository(
      StructureStatsTable
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

    const createdInteraction: Interactions = interactionDto;

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
}
