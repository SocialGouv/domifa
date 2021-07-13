import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  interactionRepository,
  InteractionsTable,
  usagerRepository,
} from "../../database";
import { MessageSmsService } from "../../sms/services/message-sms.service";

import { UsagersService } from "../../usagers/services/usagers.service";
import { AppUser, Structure, Usager, UsagerLight } from "../../_common/model";
import {
  InteractionDirection,
  InteractionEvent,
  Interactions,
} from "../../_common/model/interaction";
import { interactionsCreator } from "./interactionsCreator.service";
import { InteractionsSmsManager } from "./InteractionsSmsManager.service";
import { interactionsTypeManager } from "./interactionsTypeManager.service";

@Injectable()
export class InteractionsDeletor {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly interactionsSmsManager: InteractionsSmsManager,
    private readonly smsService: MessageSmsService
  ) {}

  public async deleteOrRestoreInteraction({
    interactionId,
    usagerRef,
    user,
    structure,
  }: {
    interactionId: number;
    usagerRef: number;
    user: Pick<AppUser, "id" | "structureId" | "nom" | "prenom">;
    structure: Pick<Structure, "id" | "sms">;
  }): Promise<UsagerLight> {
    const usager = await usagerRepository.findOne({
      structureId: structure.id,
      ref: usagerRef,
    });

    const interaction = await interactionRepository.findOne({
      id: interactionId,
      structureId: structure.id,
      usagerRef,
    });

    if (!interaction || interaction === null) {
      throw new HttpException("INTERACTION_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    const newEvent: InteractionEvent =
      interaction.event === "create" ? "delete" : "create"; // 'create' means 'restore' here

    const direction = interactionsTypeManager.getDirection(interaction);

    // always delete previous interaction ('delete' or 'create' ('restore') event)
    const deletedInteraction = await interactionRepository.deleteByCriteria({
      id: interaction.id,
      structureId: structure.id,
      usagerRef: interaction.usagerRef,
    });
    if (!deletedInteraction) {
      throw new HttpException("INTERACTION_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    if (newEvent === "delete") {
      // create a "delete" interaction
      await this._createDeleteInteraction({
        user,
        structure,
        interaction,
        newEvent,
      });

      if (interaction.type === "npai") {
        usager.options.npai.actif = false;
        usager.options.npai.dateDebut = null;

        return this.usagersService.patch({ uuid: usager.uuid }, usager);
      }

      if (direction === "in") {
        // Suppression du SMS en file d'attente
        await this.smsService.deleteSmsInteraction(
          usager,
          structure.id,
          interaction
        );
      }

      return this.updateUsagerLastInteractionAfterDeleteLast({
        user,
        usager,
        interaction,
        direction,
      });
    } else {
      // restore deleted interaction

      // même traitement que lors de la création d'une interaction
      const created = await interactionsCreator.createInteraction({
        interaction: interaction.previousValue,
        usager,
        user,
      });

      if (direction === "in") {
        await this.interactionsSmsManager.updateSmsAfterCreation({
          interaction: created.interaction,
          structure,
          usager: created.usager,
        });
      }

      const deleteInteraction = new InteractionsTable(
        interaction.previousValue
      );

      await interactionRepository.save(deleteInteraction);

      return created.usager;
    }
  }

  private _createDeleteInteraction({
    user,
    structure,
    interaction,
    newEvent,
  }: {
    user: Pick<AppUser, "id" | "structureId" | "nom" | "prenom">;
    structure: Pick<Structure, "id" | "sms">;
    interaction: Interactions;
    newEvent: InteractionEvent;
  }) {
    const deleteInteraction = new InteractionsTable({
      ...interaction,
      uuid: undefined, // generate new uuid
      structureId: structure.id,
      userId: user.id,
      userName: user.prenom + " " + user.nom,
      dateInteraction: new Date(),
      event: newEvent,
      previousValue: interaction,
    });

    return interactionRepository.save(deleteInteraction);
  }

  private async updateUsagerLastInteractionAfterDeleteLast({
    user,
    usager,
    interaction,
    direction,
  }: {
    user: Pick<AppUser, "id" | "structureId" | "nom" | "prenom">;
    usager: Usager;
    interaction: Interactions;
    direction: InteractionDirection;
  }) {
    if (direction === "in") {
      const outType = interactionsTypeManager.getOppositeDirectionalType({
        type: interaction.type,
      });

      const last = await interactionRepository.findLastInteraction({
        usagerRef: usager.ref,
        dateInteraction: interaction.dateInteraction,
        typeInteraction: outType,
        user,
        isIn: "in",
        event: "create",
      });

      if (!last || last === null) {
        if (interaction.nbCourrier) {
          usager.lastInteraction[interaction.type] =
            usager.lastInteraction[interaction.type] - interaction.nbCourrier;
        }
      }
    } else if (direction === "out") {
      const inType = interactionsTypeManager.getOppositeDirectionalType({
        type: interaction.type,
        direction,
      });

      if (interaction.nbCourrier) {
        usager.lastInteraction[inType] =
          usager.lastInteraction[inType] + interaction.nbCourrier;
      }
    }

    // Recherche de la dernière date de passage
    const lastInteraction = await interactionRepository.findLastInteractionOk({
      user,
      usager,
      event: "create",
    });
    const lastInteractionDate = lastInteraction?.dateInteraction;

    if (lastInteractionDate) {
      // Si la date de la dernière décision a lieu après la dernière interaction, on l'assigne à lastInteraction.dateInteraction
      usager.lastInteraction.dateInteraction =
        lastInteractionDate > new Date(usager.decision.dateDecision)
          ? lastInteractionDate
          : usager.decision.dateDecision;
    } else {
      usager.lastInteraction.dateInteraction = usager.decision.dateDecision;
    }

    // recalcul des totaux: ne fonctionne que si on supprime la dernière interaction
    // NOTE @toub 2021-06-29: j'ai envisagé de recalculer tous les compteurs (voir fichier `sum_all_interactions.aggregate.sql`)
    // mais hélas, ils ne correspondent pas à la valeur qu'on a dans "lastInteraction"
    // donc il faudrait mieux revoir le modèle de données

    usager.lastInteraction.enAttente =
      usager.lastInteraction.courrierIn > 0 ||
      usager.lastInteraction.colisIn > 0 ||
      usager.lastInteraction.recommandeIn > 0;
    return this.usagersService.patch({ uuid: usager.uuid }, usager);
  }
}
