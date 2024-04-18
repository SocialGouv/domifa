import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { interactionRepository } from "../../database";
import { MessageSmsService } from "../../sms/services/message-sms.service";
import { UsagerLight } from "../../_common/model";
import { interactionsCreator } from "./interactionsCreator.service";
import { interactionsTypeManager } from "./interactionsTypeManager.service";
import { getLastInteractionOut } from "./getLastInteractionDate.service";
import { Usager, CommonInteraction, Structure } from "@domifa/common";

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
    interaction: CommonInteraction;
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
    }

    usager.lastInteraction.dateInteraction = await getLastInteractionOut(
      usager,
      structure
    );

    return await interactionsCreator.updateUsagerAfterCreation({
      usager,
    });
  }
}
