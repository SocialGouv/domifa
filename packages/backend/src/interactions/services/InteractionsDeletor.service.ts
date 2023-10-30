import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { interactionRepository, usagerRepository } from "../../database";
import { MessageSmsService } from "../../sms/services/message-sms.service";
import {
  Interactions,
  Usager,
  UserStructure,
  Structure,
  UsagerLight,
  INTERACTION_OK_LIST,
} from "../../_common/model";
import { interactionsCreator } from "./interactionsCreator.service";
import { interactionsTypeManager } from "./interactionsTypeManager.service";
import { InteractionEvent } from "@domifa/common";

@Injectable()
export class InteractionsDeletor {
  constructor(
    @Inject(forwardRef(() => MessageSmsService))
    private readonly smsService: MessageSmsService
  ) {}

  public async deleteOrRestoreInteraction({
    interaction,
    usager,
    user,
    structure,
  }: {
    interaction: Interactions;
    usager: Usager;
    user: Pick<
      UserStructure,
      "id" | "structureId" | "nom" | "prenom" | "structure"
    >;
    structure: Pick<Structure, "id" | "sms" | "telephone">;
  }): Promise<UsagerLight> {
    const newEvent: InteractionEvent =
      interaction.event === "create" ? "delete" : "create"; // 'create' means 'restore' here

    const direction = interactionsTypeManager.getDirection(interaction);

    // Toute les interactions sortantes sont supprimés
    if (direction === "out") {
      await interactionRepository.update(
        { interactionOutUUID: interaction.uuid },
        { interactionOutUUID: null }
      );
    }

    // always delete previous interaction ('delete' or 'create' ('restore') event)
    await interactionRepository.delete({
      uuid: interaction.uuid,
    });

    //
    // 1. Suppression d'une interaction
    //
    if (newEvent === "delete") {
      // create a "delete" interaction
      await this._createDeleteInteraction({
        user,
        interaction,
        newEvent,
      });

      if (direction === "in") {
        // Suppression du SMS en file d'attente
        await this.smsService.deleteSmsInteraction(
          usager,
          structure,
          interaction
        );
      }

      if (direction === "out") {
        // On remet tous les courriers en "à distribuer"
        await interactionRepository.update(
          { interactionOutUUID: interaction.uuid },
          { interactionOutUUID: null }
        );

        await this.smsService.updateSmsAfterCreation({
          interaction,
          structure,
          usager,
        });
      }
      // Désactiver le NPAI
      if (interaction.type === "npai") {
        usager.options.npai.actif = false;
        usager.options.npai.dateDebut = null;

        return usagerRepository.updateOneAndReturn(usager.uuid, {
          options: usager.options,
        });
      }

      const dateInteractionWithGoodTimeZone = new Date(
        usager.lastInteraction.dateInteraction
      );

      // Récupération de la bonne date de dernière interaction
      if (INTERACTION_OK_LIST.indexOf(interaction.type) !== -1) {
        // Seulement si aucun autre évènement n'a déjà changé la date de dernier passage
        // C'est possible si un renouvellement a été effectué après la saisie de ce courrier
        if (dateInteractionWithGoodTimeZone <= interaction.dateInteraction) {
          const lastInteractionOk =
            await interactionRepository.findLastInteractionOk({
              user,
              usager,
              event: "create",
            });

          // Si aucune interaction est trouvée, on remet la date de la décision actuelle
          usager.lastInteraction.dateInteraction = lastInteractionOk
            ? lastInteractionOk.dateInteraction
            : usager.decision.dateDebut;
        }
      }

      return await interactionsCreator.updateUsagerAfterCreation({
        usager,
        structure: user.structure,
      });
    }

    //
    // 2. Restauration d'une interaction
    //    On effectue le même traitement que lors de la création d'une interaction
    //
    const created = await interactionsCreator.createInteraction({
      interaction: interaction.previousValue,
      usager,
      user,
    });

    if (direction === "in") {
      await this.smsService.updateSmsAfterCreation({
        interaction: created.interaction,
        structure,
        usager,
      });
    }

    if (direction === "out") {
      await this.smsService.deleteSmsInteraction(
        usager,
        structure,
        created.interaction
      );
    }

    // Désactiver le NPAI
    if (created.interaction.type === "npai") {
      usager.options.npai.actif = true;
      usager.options.npai.dateDebut = new Date(
        created.interaction.dateInteraction
      );

      return usagerRepository.updateOneAndReturn(usager.uuid, {
        options: usager.options,
        lastInteraction: usager.lastInteraction,
      });
    }

    return created.usager;
  }

  private async _createDeleteInteraction({
    user,
    interaction,
    newEvent,
  }: {
    user: Pick<
      UserStructure,
      "id" | "structureId" | "nom" | "prenom" | "structure"
    >;
    interaction: Interactions;
    newEvent: InteractionEvent;
  }) {
    const newInteraction: Interactions = {
      ...interaction,
      structureId: user.structureId,
      event: newEvent,
      previousValue: interaction,
    };

    newInteraction.uuid = undefined;

    return interactionRepository.save(newInteraction);
  }
}
