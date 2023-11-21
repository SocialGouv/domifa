import { Injectable, Inject, forwardRef } from "@nestjs/common";
import {
  interactionRepository,
  usagerRepository,
  userUsagerLoginRepository,
} from "../../database";
import { MessageSmsService } from "../../sms/services/message-sms.service";
import {
  Interactions,
  Usager,
  Structure,
  UsagerLight,
  INTERACTION_OK_LIST,
} from "../../_common/model";
import { interactionsCreator } from "./interactionsCreator.service";
import { interactionsTypeManager } from "./interactionsTypeManager.service";
import { In } from "typeorm";
import { differenceInCalendarDays } from "date-fns";

@Injectable()
export class InteractionsDeletor {
  constructor(
    @Inject(forwardRef(() => MessageSmsService))
    private readonly smsService: MessageSmsService
  ) {}

  public async deleteInteraction({
    interaction,
    usager,
    structure,
  }: {
    interaction: Interactions;
    usager: Usager;
    structure: Pick<Structure, "id" | "sms" | "telephone" | "portailUsager">;
  }): Promise<UsagerLight> {
    const direction = interactionsTypeManager.getDirection(interaction);

    await interactionRepository.delete({
      uuid: interaction.uuid,
    });

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

    if (INTERACTION_OK_LIST.indexOf(interaction.type) !== -1) {
      const lastInteractionOut = await interactionRepository.findOne({
        where: {
          usagerUUID: usager.uuid,
          type: In(INTERACTION_OK_LIST),
        },
        select: {
          dateInteraction: true,
        },
        order: { dateInteraction: "DESC" },
      });

      usager.lastInteraction.dateInteraction =
        lastInteractionOut?.dateInteraction ?? usager.decision.dateDebut;
    }

    // Si le portail est activé, on récupère la date de dernière connexion
    if (
      structure.portailUsager.usagerLoginUpdateLastInteraction &&
      usager.options.portailUsagerEnabled
    ) {
      const lastUserUsagerLogin = await userUsagerLoginRepository.findOne({
        where: {
          usagerUUID: usager.uuid,
        },
        select: {
          createdAt: true,
        },
        order: { createdAt: "DESC" },
      });

      if (lastUserUsagerLogin?.createdAt) {
        if (
          differenceInCalendarDays(
            usager.lastInteraction.dateInteraction,
            lastUserUsagerLogin.createdAt
          ) > 0
        ) {
          usager.lastInteraction.dateInteraction =
            lastUserUsagerLogin.createdAt;
        }
      }
    }

    return await interactionsCreator.updateUsagerAfterCreation({
      usager,
    });
  }
}
