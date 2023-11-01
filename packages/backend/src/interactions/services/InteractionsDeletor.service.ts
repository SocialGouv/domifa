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

@Injectable()
export class InteractionsDeletor {
  constructor(
    @Inject(forwardRef(() => MessageSmsService))
    private readonly smsService: MessageSmsService
  ) {}

  public async deleteInteraction({
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
    const direction = interactionsTypeManager.getDirection(interaction);
    if (direction === "in") {
      // Suppression du SMS en file d'attente
      await this.smsService.deleteSmsInteraction(
        usager,
        structure,
        interaction
      );
    } else if (direction === "out") {
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
    } else if (interaction.type === "npai") {
      usager.options.npai.actif = false;
      usager.options.npai.dateDebut = null;

      return usagerRepository.updateOneAndReturn(usager.uuid, {
        options: usager.options,
      });
    }

    await interactionRepository.delete({
      uuid: interaction.uuid,
    });

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
}
