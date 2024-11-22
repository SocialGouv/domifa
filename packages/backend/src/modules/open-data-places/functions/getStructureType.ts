import { StructureType } from "@domifa/common";
import slug from "slug";
import striptags from "striptags";

export const getStructureType = (input: string): StructureType | null => {
  if (!input) {
    return null;
  }
  const strippedInput = striptags(input).toLowerCase().trim();

  const normalizedInput = slug(strippedInput, {
    mode: "rfc3986" as const,
    lower: true,
    replacement: " ", // Utiliser des espaces au lieu des tirets
    remove: /[^a-z0-9\s]/g, // Supprimer tous les caractères non alphanumériques sauf les espaces
    locale: "fr",
    trim: true,
  });

  if (!normalizedInput) {
    return null;
  }

  if (
    normalizedInput.includes("ccas") ||
    normalizedInput.startsWith("commune") ||
    normalizedInput.startsWith("centre communal") ||
    normalizedInput.startsWith("centre communal daction sociale") ||
    normalizedInput.includes("centre daction sociale") ||
    normalizedInput.startsWith("mairie") ||
    normalizedInput.startsWith("hotel de ville")
  ) {
    return "ccas";
  }

  if (
    normalizedInput.startsWith("cias") ||
    normalizedInput.startsWith("centre intercommunal") ||
    normalizedInput.includes("communaute de communes") ||
    normalizedInput.includes("centre intercommunal daction sociale") ||
    normalizedInput.includes("intercommunal")
  ) {
    return "cias";
  }

  return "asso";
};
