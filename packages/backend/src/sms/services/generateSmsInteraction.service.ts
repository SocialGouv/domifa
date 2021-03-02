import moment = require("moment");
import { UsagerLight } from "../../database";
import { InteractionDto } from "../../interactions/interactions.dto";

export function generateSmsInteraction(
  usager: UsagerLight,
  interaction: InteractionDto
): string {
  //

  const nomComplet = usager.prenom + " " + usager.nom;
  const dateInMessage = moment(interaction.dateInteraction)
    .locale("fr")
    .format("L");

  const interactionLabels = {
    colisIn: "colis",
    courrierIn: "courriers",
    recommandeIn: "avis de passage",
  };

  //
  const interactionValue = interactionLabels[interaction.type];
  //
  return `Bonjour ${nomComplet}\nVous avez reçu ${interaction.nbCourrier} ${interactionValue} le ${dateInMessage}, à récupérer au sein de : nom de la structure aux horaires habituels d’ouverture.\nBonne journée`;
}
