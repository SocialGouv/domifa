import { differenceInYears, format, isValid, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { distance } from "fastest-levenshtein";
import { normalizeString } from "@domifa/common";

import {
  FAMILLES_SCORE_DOUTEUX,
  FAMILLES_SCORE_IDENTIQUE,
  FAMILLES_SCORE_SAME_PERSON,
  FAMILLES_SCORE_TRES_PROCHE,
} from "../constants/FAMILLES_ANALYSIS.const";
import {
  AyantDroitLight,
  DossierLight,
  MatchBucket,
  MatchResult,
} from "../types/famillesAnalysis.types";

const PARIS_TZ = "Europe/Paris";
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// Lowercase, no accents, no spaces, no hyphens. Reuses the shared normalizeString
// (NFKD, accent strip, œ/æ folding) then drops the remaining whitespace.
const cleanPart = (value: string | null | undefined): string =>
  normalizeString(value ?? "").replace(/\s/g, "");

// Normalized "nom|prenom" key used for every name comparison.
export const normalizeCompareKey = (
  nom: string | null | undefined,
  prenom: string | null | undefined
): string => `${cleanPart(nom)}|${cleanPart(prenom)}`;

// Calendar day as "yyyy-MM-dd". A plain date string (an ayant droit's, stored
// without a timezone and usually already "yyyy-MM-dd") is returned untouched; a
// dossier's `timestamptz`, read back as an instant, is resolved to its
// Europe/Paris day so the result does not depend on the Node process timezone.
export const toParisDay = (
  value: Date | string | null | undefined
): string | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  let date: Date;
  if (typeof value === "string") {
    // a bare "yyyy-MM-dd" is already a calendar day: no timezone shift
    if (DATE_ONLY.test(value)) {
      return value;
    }
    date = parseISO(value);
    if (!isValid(date)) {
      date = new Date(value);
    }
  } else {
    date = value instanceof Date ? value : new Date(value);
  }

  if (!isValid(date)) {
    return null;
  }

  return format(utcToZonedTime(date, PARIS_TZ), "yyyy-MM-dd");
};

// Levenshtein distance turned into a 0-100 score. 100 = strictly identical.
const componentScore = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) {
    return 0;
  }
  return Math.round((1 - distance(a, b) / maxLen) * 100);
};

// "nom|prenom" -> ["nom", "prenom"]. normalizeCompareKey only ever produces
// letters/digits either side of a single "|", so splitting on the first one
// is safe.
const splitKey = (key: string): [string, string] => {
  const separator = key.indexOf("|");
  return separator === -1
    ? [key, ""]
    : [key.slice(0, separator), key.slice(separator + 1)];
};

// Average of the nom score and the prenom score, each scored on its own
// length. Scoring the concatenated "nom|prenom" key as one string would let a
// long identical surname dilute a completely different first name — e.g.
// "dupont-martin|alice" vs "dupont-martin|bruno" scores ~77 on the combined
// string despite the two first names sharing nothing, enough to be treated as
// a couple. Averaging the two components keeps the surname from masking the
// first name.
export const scoreFromDistance = (a: string, b: string): number => {
  const [nomA, prenomA] = splitKey(a);
  const [nomB, prenomB] = splitKey(b);
  return Math.round(
    (componentScore(nomA, nomB) + componentScore(prenomA, prenomB)) / 2
  );
};

export const bucketFromScore = (score: number): MatchBucket => {
  if (score >= FAMILLES_SCORE_IDENTIQUE) {
    return "identical";
  }
  if (score >= FAMILLES_SCORE_TRES_PROCHE) {
    return "very_close";
  }
  if (score >= FAMILLES_SCORE_DOUTEUX) {
    return "doubtful";
  }
  return "not_found";
};

// Best dossier for a person, among the dossiers sharing their birth day.
// Levenshtein is only ever computed inside a single birth-day group.
export const bestMatch = (
  targetKey: string,
  birthDay: string | null,
  candidatesByDay: Map<string, DossierLight[]>,
  excludeUuid?: string
): MatchResult => {
  if (!birthDay) {
    return { score: 0, candidate: null };
  }

  let best: MatchResult = { score: -1, candidate: null };
  for (const candidate of candidatesByDay.get(birthDay) ?? []) {
    if (excludeUuid && candidate.uuid === excludeUuid) {
      continue;
    }
    const score = scoreFromDistance(targetKey, candidate.key);
    if (score > best.score) {
      best = { score, candidate };
    }
  }

  return best.candidate ? best : { score: 0, candidate: null };
};

export interface ChildMatch {
  indexA: number;
  indexB: number;
}

// Children declared on both dossiers of a couple that are the same person,
// using the same comparison rule (same birth day, key score >= SAME_PERSON).
// Greedy 1-to-1 pairing: each child on side B is matched at most once. Indices
// are positions in the arrays as passed in, for the caller to trace each match
// back to the original ayant droit it came from.
export const matchCommonChildren = (
  childrenA: Pick<AyantDroitLight, "birthDay" | "key">[],
  childrenB: Pick<AyantDroitLight, "birthDay" | "key">[]
): ChildMatch[] => {
  const usedB = new Set<number>();
  const matches: ChildMatch[] = [];

  childrenA.forEach((childA, indexA) => {
    if (!childA.birthDay) {
      return;
    }
    let bestIndex = -1;
    let bestScore = -1;
    for (let i = 0; i < childrenB.length; i++) {
      if (usedB.has(i) || childrenB[i].birthDay !== childA.birthDay) {
        continue;
      }
      const score = scoreFromDistance(childA.key, childrenB[i].key);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
    if (bestIndex >= 0 && bestScore >= FAMILLES_SCORE_SAME_PERSON) {
      usedB.add(bestIndex);
      matches.push({ indexA, indexB: bestIndex });
    }
  });

  return matches;
};

// Number of children declared on both dossiers of a couple. See matchCommonChildren.
export const countCommonChildren = (
  childrenA: Pick<AyantDroitLight, "birthDay" | "key">[],
  childrenB: Pick<AyantDroitLight, "birthDay" | "key">[]
): number => matchCommonChildren(childrenA, childrenB).length;

// Age >= 18 at the reference instant, from the "yyyy-MM-dd" birth day.
export const isAdultOn = (
  birthDay: string | null,
  reference: number
): boolean => {
  if (!birthDay) {
    return false;
  }
  const birthDate = parseISO(birthDay);
  return isValid(birthDate) && differenceInYears(reference, birthDate) >= 18;
};
