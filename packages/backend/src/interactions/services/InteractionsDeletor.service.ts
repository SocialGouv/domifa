import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  interactionRepository,
  InteractionsTable,
  usagerRepository,
} from "../../database";
import { SmsService } from "../../sms/services/sms.service";
import { UsagersService } from "../../usagers/services/usagers.service";
import { AppUser, Usager } from "../../_common/model";
import { Interactions, InteractionType } from "../../_common/model/interaction";

@Injectable()
export class InteractionsDeletor {
  constructor(
    private readonly usagersService: UsagersService,
    private readonly smsService: SmsService
  ) {}

  public async deleteInteraction({
    interactionId,
    usagerRef,
    user,
  }: {
    interactionId: number;
    usagerRef: number;
    user: Pick<AppUser, "structureId" | "id" | "nom" | "prenom">;
  }) {
    const usager = await usagerRepository.findOne({
      structureId: user.structureId,
      ref: usagerRef,
    });

    const interaction = await interactionRepository.findOne({
      id: interactionId,
      structureId: user.structureId,
      usagerRef,
    });

    if (!interaction || interaction === null) {
      throw new HttpException("INTERACTION_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    if (interaction.type === "npai") {
      usager.options.npai.actif = false;
      usager.options.npai.dateDebut = null;

      const delInteraction = await this._deleteOrRestore({
        user,
        interaction,
      });

      if (delInteraction) {
        return this.usagersService.patch({ uuid: usager.uuid }, usager);
      }
    }

    const interactionMeta = this.getInteractionMeta(interaction);

    if (interactionMeta.interactionIn && interaction.event === "create") {
      // Suppression du SMS en file d'attente
      const smsToDelete = await this.smsService.deleteSmsInteraction(
        usager,
        user.structureId,
        interaction
      );
    }
    // TODO en cas de restauration, recréer le SMS si il n'a pas encore été envoyé?

    const deletedInteraction = await this._deleteOrRestore({
      user,
      interaction,
    });

    if (deletedInteraction === null || !deletedInteraction) {
      throw new HttpException(
        "INTERACTION_DELETE_IMPOSSIBLE",
        HttpStatus.BAD_REQUEST
      );
    }

    return await this.updateUsagerLastInteractionAfterDeleteOrRestoreLast({
      user,
      usager,
      interaction,
      interactionMeta,
    });
  }

  private getInteractionMeta(i: Interactions): {
    interactionOut: boolean;
    interactionIn: boolean;
    oppositeType: InteractionType;
  } {
    const len = i.type.length;

    const interactionOut = i.type.substring(len - 3) === "Out";

    const interactionIn = i.type.substring(len - 2) === "In";

    const oppositeType = (interactionIn
      ? i.type.substring(0, len - 2) + "Out"
      : interactionOut
      ? i.type.substring(0, len - 3) + "In"
      : undefined) as unknown as InteractionType;

    return {
      interactionOut,
      interactionIn,
      oppositeType,
    };
  }

  private async _deleteOrRestore({
    interaction,
    user,
  }: {
    interaction: Interactions;
    user: Pick<AppUser, "structureId" | "id" | "nom" | "prenom">;
  }) {
    if (interaction.event === "create") {
      // create a "delete" interaction
      await this._createDeleteInteraction({
        user,
        interaction,
      });
    } else {
      // restore deleted interaction
      await this._restoreDeleteInteraction({
        interaction,
      });
    }
    // delete interaction
    const retour = interactionRepository.deleteByCriteria({
      id: interaction.id,
      structureId: user.structureId,
      usagerRef: interaction.usagerRef,
    });

    if (!retour || retour === null) {
      throw new HttpException("CANNOT_DELETE_INTERACTION", 500);
    }
    return retour;
  }

  private _createDeleteInteraction({
    user,
    interaction,
  }: {
    user: Pick<AppUser, "structureId" | "id" | "nom" | "prenom">;
    interaction: Interactions;
  }) {
    const deleteInteraction = new InteractionsTable({
      ...interaction,
      uuid: undefined, // generate new uuid
      structureId: user.structureId,
      userId: user.id,
      userName: user.prenom + " " + user.nom,
      dateInteraction: new Date(),
      event: "delete",
      previousValue: interaction,
    });

    return interactionRepository.save(deleteInteraction);
  }

  private _restoreDeleteInteraction({
    interaction,
  }: {
    interaction: Interactions;
  }) {
    const deleteInteraction = new InteractionsTable(interaction.previousValue);

    return interactionRepository.save(deleteInteraction);
  }
  private async updateUsagerLastInteractionAfterDeleteOrRestoreLast({
    user,
    usager,
    interaction,
    interactionMeta,
  }: {
    user: Pick<AppUser, "structureId" | "nom" | "prenom" | "id">;
    usager: Usager;
    interaction: Interactions;
    interactionMeta: {
      interactionOut: boolean;
      interactionIn: boolean;
      oppositeType: InteractionType;
    };
  }) {
    // TODO prendre en compte le type 'create' ou 'delete'

    if (interactionMeta.interactionIn) {
      const outType = interactionMeta.oppositeType;

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
    } else if (interactionMeta.interactionOut) {
      const inType = interactionMeta.oppositeType;

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

    // recalcul des totaux

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
