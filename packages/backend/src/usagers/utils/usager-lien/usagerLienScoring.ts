import { distance } from "fastest-levenshtein";
import { normalizeString } from "@domifa/common";

const cleanPart = (value: string | null | undefined): string =>
  normalizeString(value ?? "").replace(/\s/g, "");

function componentScore(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) {
    return 0;
  }
  return Math.round((1 - distance(a, b) / maxLen) * 100);
}

// Score 0-100 : moyenne du score de similarité (Levenshtein) sur le nom et
// sur le prénom, calculés séparément — évite qu'un nom de famille long et
// identique masque un prénom complètement différent.
export function scoreNamePair(
  a: { nom: string; prenom: string },
  b: { nom: string; prenom: string }
): number {
  return Math.round(
    (componentScore(cleanPart(a.nom), cleanPart(b.nom)) +
      componentScore(cleanPart(a.prenom), cleanPart(b.prenom))) /
      2
  );
}
