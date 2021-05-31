import { HttpException, Injectable } from "@nestjs/common";
import { FindConditions, LessThan, MoreThan } from "typeorm";
import {
  interactionRepository,
  InteractionsTable,
  usagerLightRepository,
} from "../database";
import { AppAuthUser, AppUser, Usager, UsagerLight } from "../_common/model";
import { Interactions, InteractionType } from "../_common/model/interaction";
import { InteractionDto } from "./interactions.dto";

@Injectable()
export class InteractionsService {
  constructor() {}
  public async create({
    interaction,
    usager,
    user,
  }: {
    interaction: InteractionDto;
    usager: UsagerLight;
    user: Pick<AppAuthUser, "id" | "structureId" | "nom" | "prenom">;
  }): Promise<UsagerLight> {
    const buildedInteraction = buildNewInteraction({
      interaction,
      usager,
      user,
    });

    const newInteraction = buildedInteraction.newInteraction;
    const lastInteraction = buildedInteraction.usager.lastInteraction;

    const createdInteraction: Interactions = new InteractionsTable(
      newInteraction
    );

    await interactionRepository.save(createdInteraction);

    return usagerLightRepository.updateOne(
      { uuid: usager.uuid },
      { lastInteraction }
    );
  }

  public async find(
    usagerRef: number,
    user: Pick<AppUser, "structureId">
  ): Promise<any> {
    return interactionRepository.findMany(
      { structureId: user.structureId, usagerRef },
      {
        order: {
          dateInteraction: "DESC",
        },
        skip: 0,
        maxResults: 30,
      }
    );
  }

  public async findOne(
    usagerRef: number,
    interactionId: number,
    user: Pick<AppUser, "structureId">
  ): Promise<Interactions | null> {
    return interactionRepository.findOne({
      id: interactionId,
      structureId: user.structureId,
      usagerRef,
    });
  }

  public async findLastInteractionOk(
    usager: Pick<Usager, "ref">,
    user: Pick<AppAuthUser, "structureId">
  ): Promise<Interactions[] | [] | null> {
    return interactionRepository.findLastInteractionOk(user, usager);
  }

  public async findLastInteraction(
    usagerRef: number,
    dateInteraction: Date,
    typeInteraction: InteractionType,
    user: Pick<AppUser, "structureId">,
    isIn: string
  ): Promise<Interactions | null> {
    const dateQuery =
      isIn === "out" ? LessThan(dateInteraction) : MoreThan(dateInteraction);

    const where: FindConditions<InteractionsTable> = {
      structureId: user.structureId,
      usagerRef,
      type: typeInteraction,
      dateInteraction: dateQuery,
    };
    return interactionRepository.findOne(where as any);
  }

  public async delete(
    usagerRef: number,
    interactionId: number,
    user: Pick<AppUser, "structureId">
  ): Promise<any> {
    const retour = interactionRepository.deleteByCriteria({
      id: interactionId,
      structureId: user.structureId,
      usagerRef,
    });

    if (!retour || retour === null) {
      throw new HttpException("CANNOT_DELETE_INTERACTION", 500);
    }
    return retour;
  }

  public async totalInteraction(
    structureId: number,
    usagerRef: number,
    interactionType: InteractionType
  ): Promise<number> {
    if (interactionType === "appel" || interactionType === "visite") {
      return interactionRepository.count({
        where: {
          structureId,
          usagerRef,
          type: interactionType,
        },
      });
    } else {
      const search = await (await interactionRepository.typeorm())
        .createQueryBuilder("interactions")
        .select("SUM(interactions.nbCourrier)", "sum")
        .where({ structureId, usagerRef, type: interactionType })
        .groupBy("interactions.type")
        .getRawOne();
      return typeof search !== "undefined" ? search.sum : 0;
    }
  }
}

function buildNewInteraction({
  interaction,
  usager,
  user,
}: {
  interaction: InteractionDto;
  usager: Pick<Usager, "ref" | "uuid" | "lastInteraction" | "options">;
  user: Pick<AppAuthUser, "id" | "structureId" | "nom" | "prenom">;
}): {
  usager: Pick<Usager, "lastInteraction">;
  newInteraction: Omit<InteractionsTable, "_id" | "id">;
} {
  const newInteraction = new InteractionsTable(interaction);
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
    // La procuration ne remet pas à jour le dernier passage
    if (interaction.procuration) {
      newInteraction.content =
        "Courrier remis au mandataire : " +
        usager.options.procuration.prenom +
        " " +
        usager.options.procuration.nom.toUpperCase();
    } else {
      usager.lastInteraction.dateInteraction = new Date();
    }

    // Transfert actif: on le précise dans le contenu
    if (usager.options.transfert.actif) {
      newInteraction.content =
        "Courrier transféré à : " +
        usager.options.transfert.nom +
        " - " +
        usager.options.transfert.adresse.toUpperCase();
    }

    const inType = interaction.type.substring(0, len - 3) + "In";
    newInteraction.nbCourrier = usager.lastInteraction[inType] || 1;

    usager.lastInteraction[inType] = 0;

    usager.lastInteraction.enAttente =
      usager.lastInteraction.courrierIn > 0 ||
      usager.lastInteraction.colisIn > 0 ||
      usager.lastInteraction.recommandeIn > 0;
  } else {
    newInteraction.nbCourrier = 0;
  }

  if (interaction.type === "visite" || interaction.type === "appel") {
    usager.lastInteraction.dateInteraction = new Date();
  }

  newInteraction.structureId = user.structureId;
  newInteraction.usagerRef = usager.ref;
  newInteraction.usagerUUID = usager.uuid;
  newInteraction.userId = user.id;
  newInteraction.userName = user.prenom + " " + user.nom;

  newInteraction.dateInteraction = new Date();

  return { usager, newInteraction };
}
