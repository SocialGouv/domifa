import { UsagerLight } from "../../../database";
import { InteractionDto } from "../../../interactions/interactions.dto";

export function generateSmsInteraction(
  usager: UsagerLight,
  interaction: InteractionDto
): string {
  //

  const nomComplet = usager.prenom + " " + usager.nom;

  const interactionLabels = {
    colisIn: "colis",
    courrierIn: "courriers",
    recommandeIn: "avis de passage",
  };

  //
  const interactionValue = interactionLabels[interaction.type];
  //
  return `Bonjour ${nomComplet}\nVous avez reçu ${interaction.nbCourrier} nouveaux ${interactionValue}\n`;
}
