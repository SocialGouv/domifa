import { InteractionDto } from "../../../interactions/interactions.dto";

export function generateSmsInteraction(
  interaction: InteractionDto,
  senderDetails: string
): string {
  const interactionLabels = {
    colisIn: "colis",
    courrierIn: "courriers",
    recommandeIn: "avis de passage",
  };

  //
  const interactionValue = interactionLabels[interaction.type];
  //
  return (
    "Bonjour, \nVous avez reçu " +
    interaction.nbCourrier +
    " nouveaux " +
    interactionValue +
    "\n\n" +
    senderDetails
  );
}
