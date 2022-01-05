import { Injectable } from "@nestjs/common";
import { interactionRepository } from "../../database";
import { MessageSmsService } from "../../sms/services/message-sms.service";
import { UsagersService } from "../../usagers/services/usagers.service";
import { Structure, UsagerLight, UserStructure } from "../../_common/model";
import {
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
    interaction,
    usager,
    user,
    structure,
  }: {
    interaction: Interactions;
    usager: UsagerLight;
    user: Pick<UserStructure, "id" | "structureId" | "nom" | "prenom">;
    structure: Pick<Structure, "id" | "sms">;
  }): Promise<UsagerLight> {
    const newEvent: InteractionEvent =
      interaction.event === "create" ? "delete" : "create"; // 'create' means 'restore' here

    const direction = interactionsTypeManager.getDirection(interaction);

    // Toute les interactions sortantes sont supprimés
    if (direction === "out") {
      await interactionRepository.updateMany(
        { interactionOutUUID: interaction.uuid },
        { interactionOutUUID: null }
      );
    }

    // always delete previous interaction ('delete' or 'create' ('restore') event)
    await interactionRepository.deleteByCriteria({
      uuid: interaction.uuid,
    });

    if (newEvent === "delete") {
      // create a "delete" interaction
      await this._createDeleteInteraction({
        user,
        interaction,
        newEvent,
      });

      // Suppression du SMS en file d'attente
      if (direction === "in") {
        await this.smsService.deleteSmsInteraction(
          usager,
          structure.id,
          interaction
        );
      } else if (direction === "out") {
        // On remet tous les courriers en "à distribuer"
        await interactionRepository.updateMany(
          { interactionOutUUID: interaction.uuid },
          { interactionOutUUID: null }
        );

        // Mise à jour du SMS
        await this.interactionsSmsManager.updateSmsAfterCreation({
          interaction,
          structure,
          usager,
        });
      } else {
        // Désactiver le NPAI
        if (interaction.type === "npai") {
          usager.options.npai.actif = false;
          usager.options.npai.dateDebut = null;
          return this.usagersService.patch(
            { uuid: usager.uuid },
            { options: usager.options }
          );
        }
      }
      return await interactionsCreator.updateUsagerAfterCreation({
        usager,
      });
    } else {
      // restore deleted interaction
      // même traitement que lors de la création d'une interaction
      const created = await interactionsCreator.createInteraction({
        interaction: interaction.previousValue,
        usager,
        user,
      });

      //
      if (direction === "in") {
        await this.interactionsSmsManager.updateSmsAfterCreation({
          interaction: created.interaction,
          structure,
          usager,
        });
      }
      //
      else if (direction === "out") {
        await this.smsService.deleteSmsInteraction(
          usager,
          structure.id,
          created.interaction
        );
      } else {
        // Désactiver le NPAI
        if (created.interaction.type === "npai") {
          usager.options.npai.actif = true;
          usager.options.npai.dateDebut = created.interaction.dateInteraction;

          return this.usagersService.patch(
            { uuid: usager.uuid },
            {
              options: usager.options,
              lastInteraction: usager.lastInteraction,
            }
          );
        }
      }
      return created.usager;
    }
  }

  private async _createDeleteInteraction({
    user,
    interaction,
    newEvent,
  }: {
    user: Pick<UserStructure, "id" | "structureId" | "nom" | "prenom">;
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
