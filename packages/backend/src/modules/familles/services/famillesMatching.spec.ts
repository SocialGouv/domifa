import {
  bucketFromScore,
  countCommonChildren,
  isAdultOn,
  matchBest,
  normalizeCompareKey,
  scoreFromDistance,
  toParisDay,
} from "./famillesMatching";
import { DossierLite } from "../types/famillesAnalysis.types";

describe("normalizeCompareKey", () => {
  it("lowercases, strips accents, spaces and hyphens", () => {
    expect(normalizeCompareKey("Bénali", "Sonia")).toBe("benali|sonia");
    expect(normalizeCompareKey("Le Guen", "Jean-Pierre")).toBe(
      "leguen|jeanpierre"
    );
    expect(normalizeCompareKey("  DÜPONT  ", "Élodie")).toBe("dupont|elodie");
  });

  it("tolerates missing parts", () => {
    expect(normalizeCompareKey(null, undefined)).toBe("|");
  });
});

describe("toParisDay", () => {
  it("keeps a bare calendar day as is", () => {
    expect(toParisDay("1990-05-14")).toBe("1990-05-14");
  });

  it("brings an instant back to the Paris calendar day", () => {
    // 1990-05-13 23:00 UTC is already 1990-05-14 in Paris (UTC+2 in May)
    expect(toParisDay("1990-05-13T23:00:00.000Z")).toBe("1990-05-14");
    expect(toParisDay(new Date("1990-05-13T23:00:00.000Z"))).toBe("1990-05-14");
  });

  it("returns null for a missing or unparseable value", () => {
    expect(toParisDay(null)).toBeNull();
    expect(toParisDay("")).toBeNull();
    expect(toParisDay("not-a-date")).toBeNull();
  });
});

describe("scoreFromDistance", () => {
  it("is 100 for identical keys", () => {
    expect(scoreFromDistance("benali|sonia", "benali|sonia")).toBe(100);
  });

  it("gives 83 for 'Sonai' vs 'Sonia' on benali|sonia (2 typos / 12)", () => {
    expect(scoreFromDistance("benali|sonai", "benali|sonia")).toBe(83);
  });

  it("is 0 when both keys are empty", () => {
    expect(scoreFromDistance("", "")).toBe(0);
  });
});

describe("bucketFromScore", () => {
  it("splits on 100 / 75 / 50", () => {
    expect(bucketFromScore(100)).toBe("identique");
    expect(bucketFromScore(99)).toBe("tres_proche");
    expect(bucketFromScore(75)).toBe("tres_proche");
    expect(bucketFromScore(74)).toBe("douteux");
    expect(bucketFromScore(50)).toBe("douteux");
    expect(bucketFromScore(49)).toBe("non_trouve");
  });
});

describe("matchBest", () => {
  const dossier = (uuid: string, dobDay: string, key: string): DossierLite => ({
    uuid,
    dobDay,
    key,
    ayantsDroits: [],
  });

  it("only compares candidates that share the birth day", () => {
    const byDob = new Map<string, DossierLite[]>([
      ["1987-02-02", [dossier("s", "1987-02-02", "benali|sonia")]],
      ["1999-09-09", [dossier("x", "1999-09-09", "benali|sonia")]],
    ]);
    const match = matchBest("benali|sonia", "1987-02-02", byDob);
    expect(match.score).toBe(100);
    expect(match.candidate?.uuid).toBe("s");
  });

  it("excludes the declaring dossier and returns 0 when nothing is left", () => {
    const byDob = new Map<string, DossierLite[]>([
      ["1987-02-02", [dossier("self", "1987-02-02", "benali|sonia")]],
    ]);
    expect(matchBest("benali|sonia", "1987-02-02", byDob, "self").score).toBe(
      0
    );
  });

  it("returns 0 when the person has no birth day", () => {
    expect(matchBest("benali|sonia", null, new Map()).score).toBe(0);
  });
});

describe("countCommonChildren", () => {
  const child = (dobDay: string, key: string) => ({ dobDay, key });

  it("counts children present on both sides, once each", () => {
    const a = [
      child("2010-03-03", "kadi|lina"),
      child("2012-04-04", "kadi|adam"),
    ];
    const b = [
      child("2010-03-03", "kadi|lina"),
      child("2012-04-04", "kadi|adam"),
      child("2015-05-05", "kadi|yanis"),
    ];
    expect(countCommonChildren(a, b)).toBe(2);
  });

  it("ignores children without a birth day", () => {
    const a = [{ dobDay: null, key: "kadi|lina" }];
    const b = [{ dobDay: null, key: "kadi|lina" }];
    expect(countCommonChildren(a, b)).toBe(0);
  });
});

describe("isAdultOn", () => {
  const ref = new Date("2026-09-07T12:00:00.000Z").getTime();

  it("is true at 18 years and older", () => {
    expect(isAdultOn("2008-09-07", ref)).toBe(true);
    expect(isAdultOn("2000-01-01", ref)).toBe(true);
  });

  it("is false below 18 or without a birth day", () => {
    expect(isAdultOn("2008-09-08", ref)).toBe(false);
    expect(isAdultOn("2015-01-01", ref)).toBe(false);
    expect(isAdultOn(null, ref)).toBe(false);
  });
});
