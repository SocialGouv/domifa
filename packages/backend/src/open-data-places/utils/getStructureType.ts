import { StructureType } from "@domifa/common";

export const checkStructureType = (input: string): StructureType | null => {
  const lowerInput = input.toLowerCase().replace(/[^\w\s]/gi, "");

  if (
    lowerInput.includes("ccas") ||
    lowerInput.includes("centre communal") ||
    lowerInput.includes("centre communal daction sociale") ||
    lowerInput.includes("mairie") ||
    lowerInput.includes("hotel de ville") ||
    lowerInput.includes("action sociale") ||
    (lowerInput.includes("centre") && lowerInput.includes("social"))
  ) {
    return "ccas";
  }

  if (
    lowerInput.includes("association") ||
    lowerInput.includes("organisme") ||
    lowerInput.includes("ong") ||
    lowerInput.includes("organisation non gouvernementale") ||
    lowerInput.includes("fondation") ||
    lowerInput.includes("collectif") ||
    lowerInput.includes("entraide")
  ) {
    return "asso";
  }

  if (
    lowerInput.includes("cias") ||
    lowerInput.includes("centre intercommunal") ||
    lowerInput.includes("centre intercommunal daction sociale") ||
    (lowerInput.includes("intercommunal") && lowerInput.includes("social"))
  ) {
    return "cias";
  }

  // Si aucune correspondance n'est trouvée
  return null;
};
