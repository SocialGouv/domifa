import { Injectable } from "@nestjs/common";
import { interactionsTypeManager } from ".";
import { SmsService } from "../../sms/services/sms.service";
import { Structure, UsagerLight } from "../../_common/model";
import {
  Interactions,
  INTERACTION_IN_CREATE_SMS,
  INTERACTION_OUT_REMOVE_SMS,
} from "../../_common/model/interaction";

@Injectable()
export class InteractionsSmsManager {
  constructor(private readonly smsService: SmsService) {}

  public async updateSmsAfterCreation({
    interaction,
    structure,
    usager,
  }: {
    interaction: Interactions;
    structure: Pick<Structure, "id" | "sms">;
    usager: UsagerLight;
  }) {
    // 1. Vérifier l'activation des SMS par la structure
    if (structure.sms.enabledByDomifa && structure.sms.enabledByStructure) {
      // 2. Vérifier l'activation du SMS pour l'usager
      if (usager.preference?.phone === true) {
        // Courrier / Colis / Recommandé entrant = Envoi de SMS à prévoir
        if (INTERACTION_IN_CREATE_SMS.includes(interaction.type)) {
          // TODO:  3. Numéro de téléphone valide
          const sms = await this.smsService.createSmsInteraction(
            usager,
            structure,
            interaction
          );
        } else if (INTERACTION_OUT_REMOVE_SMS.includes(interaction.type)) {
          const len = interaction.type.length;

          const inType = interactionsTypeManager.getOppositeDirectionalType({
            type: interaction.type,
          });

          interaction.type = inType;
          // Suppression du SMS en file d'attente
          const smsToDelete = await this.smsService.deleteSmsInteractionOut(
            usager,
            structure.id,
            interaction
          );
        }
      }
    }
  }
}
