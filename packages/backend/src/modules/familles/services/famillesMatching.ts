import { format, isValid, parseISO } from "date-fns";
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
  AyantDroitLite,
  DossierLite,
  FamillesMatchBucket,
  FamillesMatchResult,
} from "../types/famillesAnalysis.types";

const PARIS_TZ = "Europe/Paris";
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// Lowercase, no accents, no spaces, no hyphens. Reuses the shared normalizeString
// (NFKD, accent strip, œ/æ folding) then drops the remaining whitespace.
const cleanPart = (value: string | null | undefined): string =>
  normalizeString(value ?? "").replace(/\s/g, "");

export const normalizeCompareKey = (
  nom: string | null | undefined,
  prenom: string | null | undefined
): string => `${cleanPart(nom)}|${cleanPart(prenom)}`;

// Calendar day in Europe/Paris. The dossier birth date is a timestamptz, the
// dependant one is a JSON string; both are brought to the same Paris day so a
// timezone offset does not shift them apart by a day.
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
export const scoreFromDistance = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) {
    return 0;
  }
  return Math.round((1 - distance(a, b) / maxLen) * 100);
};

export const bucketFromScore = (score: number): FamillesMatchBucket => {
  if (score >= FAMILLES_SCORE_IDENTIQUE) {
    return "identique";
  }
  if (score >= FAMILLES_SCORE_TRES_PROCHE) {
    return "tres_proche";
  }
  if (score >= FAMILLES_SCORE_DOUTEUX) {
    return "douteux";
  }
  return "non_trouve";
};

// Best dossier for a person, among the dossiers sharing their birth day.
// Levenshtein is only ever computed inside a single birth-day bucket.
export const matchBest = (
  targetKey: string,
  dobDay: string | null,
  candidatesByDob: Map<string, DossierLite[]>,
  excludeUuid?: string
): FamillesMatchResult => {
  if (!dobDay) {
    return { score: 0, candidate: null };
  }

  let best: FamillesMatchResult = { score: -1, candidate: null };
  for (const candidate of candidatesByDob.get(dobDay) ?? []) {
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

// Number of children declared on both dossiers of a couple, using the same
// comparison rule (same birth day, key score >= SAME_PERSON). Greedy 1-to-1
// pairing: each child on side B is matched at most once.
export const countCommonChildren = (
  childrenA: Pick<AyantDroitLite, "dobDay" | "key">[],
  childrenB: Pick<AyantDroitLite, "dobDay" | "key">[]
): number => {
  const usedB = new Set<number>();
  let common = 0;

  for (const childA of childrenA) {
    if (!childA.dobDay) {
      continue;
    }
    let bestIdx = -1;
    let bestScore = -1;
    for (let i = 0; i < childrenB.length; i++) {
      if (usedB.has(i) || childrenB[i].dobDay !== childA.dobDay) {
        continue;
      }
      const score = scoreFromDistance(childA.key, childrenB[i].key);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0 && bestScore >= FAMILLES_SCORE_SAME_PERSON) {
      usedB.add(bestIdx);
      common++;
    }
  }

  return common;
};

// Age >= 18 at the reference instant, from the "yyyy-MM-dd" birth day.
export const isAdultOn = (
  dobDay: string | null,
  reference: number
): boolean => {
  if (!dobDay) {
    return false;
  }
  const dob = parseISO(dobDay);
  if (!isValid(dob)) {
    return false;
  }
  const ref = new Date(reference);
  let age = ref.getFullYear() - dob.getFullYear();
  const monthDelta = ref.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && ref.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
};
