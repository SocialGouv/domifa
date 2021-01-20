import { HttpException, Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { FindConditions, LessThan, MoreThan, Repository } from "typeorm";
import { appTypeormManager, InteractionsTable } from "../database";
import { Usager } from "../usagers/interfaces/usagers";
import { AppAuthUser, AppUser } from "../_common/model";
import { InteractionDto } from "./interactions.dto";
import { InteractionType, Interactions } from "../_common/model/interaction";

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
  public async create({
    interaction,
    usager,
    user,
  }: {
    interaction: InteractionDto;
    usager: Pick<Usager, "_id" | "id" | "lastInteraction" | "options">;
    user: Pick<AppAuthUser, "id" | "structureId" | "nom" | "prenom">;
  }): Promise<Usager> {
    const createdInteraction: Interactions = new InteractionsTable(
      buildInteraction({ interaction, usager, user })
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
    interactionId: number,
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
    user: Pick<AppUser, "structureId">
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

function buildInteraction({
  interaction,
  usager,
  user,
}: {
  interaction: InteractionDto;
  usager: Pick<Usager, "id" | "lastInteraction" | "options">;
  user: Pick<AppAuthUser, "id" | "structureId" | "nom" | "prenom">;
}): InteractionDto {
  const len = interaction.type.length;
  const interactionOut = interaction.type.substring(len - 3) === "Out";
  const interactionIn = interaction.type.substring(len - 2) === "In";

  if (interactionIn) {
    const count =
      typeof interaction.nbCourrier !== "undefined"
        ? interaction.nbCourrier
        : 1;

    usager.lastInteraction[interaction.type] =
      usager.lastInteraction[interaction.type] + count;
    usager.lastInteraction.enAttente = true;
  } else if (interactionOut) {
    if (interaction.procuration) {
      interaction.content =
        "Courrier remis au mandataire : " +
        usager.options.procuration.prenom +
        " " +
        usager.options.procuration.nom.toUpperCase();
    } else if (interaction.transfert) {
      interaction.content =
        "Courrier transféré à : " +
        usager.options.transfert.nom +
        " - " +
        usager.options.transfert.adresse.toUpperCase();
    }

    const inType = interaction.type.substring(0, len - 3) + "In";
    interaction.nbCourrier = usager.lastInteraction[inType] || 1;

    usager.lastInteraction[inType] = 0;

    usager.lastInteraction.enAttente =
      usager.lastInteraction.courrierIn > 0 ||
      usager.lastInteraction.colisIn > 0 ||
      usager.lastInteraction.recommandeIn > 0;
  } else {
    interaction.nbCourrier = 0;
  }

  if (
    interactionOut ||
    interaction.type === "visite" ||
    interaction.type === "appel"
  ) {
    usager.lastInteraction.dateInteraction = new Date();
  }

  interaction.structureId = user.structureId;
  interaction.usagerId = usager.id;
  interaction.userId = user.id;
  interaction.userName = user.prenom + " " + user.nom;
  if (!interaction.dateInteraction) {
    interaction.dateInteraction = new Date();
  }
  return interaction;
}
