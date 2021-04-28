import { InteractionDto } from "../../../interactions/interactions.dto";

export function generateSmsInteraction(
  interaction: InteractionDto,
  senderDetails: string
): string {
  const interactionLabels = {
    colisIn: "colis",
    courrierIn: "courrier",
    recommandeIn: "avis de passage",
  };

  //
  const interactionValue = interactionLabels[interaction.type];

  let newInteractionsLabel = "";

  if (interaction.nbCourrier > 1) {
    newInteractionsLabel = "nouveaux " + interactionValue;

    if (interaction.type === "courrierIn") {
      newInteractionsLabel = newInteractionsLabel + "s";
    }
  } else {
    newInteractionsLabel = "nouveau " + interactionValue;
    if (interaction.type === "recommandeIn") {
      newInteractionsLabel = "nouvel avis de passage";
    }
  }

  //
  return (
    "Bonjour, \n\nVous avez reçu " +
    interaction.nbCourrier +
    " " +
    newInteractionsLabel +
    "\n\n" +
    senderDetails
  );
}
