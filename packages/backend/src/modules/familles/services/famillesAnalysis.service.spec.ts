import { QueryRunner } from "typeorm";

import { appLogger, FileManagerService } from "../../../util";
import {
  cohortTotalsErrors,
  computeStructureFamillesRow,
  FamillesAnalysisService,
  toCsv,
  toDossierLight,
  UsagerRow,
} from "./famillesAnalysis.service";
import { FAMILLES_ANALYSIS_COLUMNS } from "../constants/FAMILLES_ANALYSIS.const";
import { StructureFamillesRow } from "../types/famillesAnalysis.types";
import { normalizeCompareKey } from "./famillesMatching";

jest.mock("../../../util", () => ({
  ...jest.requireActual("../../../util"),
  appLogger: { warn: jest.fn(), error: jest.fn() },
}));

// Fixed "today", so who is a minor / an adult never depends on the date the
// tests run.
const NOW = Date.parse("2026-10-19T12:00:00.000Z");

type RawAd = NonNullable<UsagerRow["ayantsDroits"]>[number];

// A declared dependant. `day` is the stored birth date ("yyyy-MM-dd"), or null.
function ad(
  nom: string,
  prenom: string,
  lien: RawAd["lien"],
  day: string | null
): RawAd {
  return { nom, prenom, lien, dateNaissance: day as unknown as Date };
}

// A dossier.
function person(
  uuid: string,
  nom: string,
  prenom: string,
  day: string,
  ayantsDroits: RawAd[] = []
): UsagerRow {
  return {
    uuid,
    nom,
    prenom,
    dateNaissance: new Date(`${day}T12:00:00.000Z`),
    ayantsDroits,
  };
}

function analyse(
  dossiers: UsagerRow[],
  elsewhere: string[] = []
): StructureFamillesRow {
  return computeStructureFamillesRow(
    1,
    dossiers.map(toDossierLight),
    new Set(elsewhere),
    NOW
  );
}

// Spec example: Karim declares Sonia (conjoint), Lina, Adam.
// Sonia declares Karim (conjoint), Lina, Adam, Yanis.
function household(soniaFirstNameOnKarimDossier: string): UsagerRow[] {
  const lina = ad("Kadi", "Lina", "ENFANT", "2010-03-03");
  const adam = ad("Kadi", "Adam", "ENFANT", "2012-04-04");
  const yanis = ad("Kadi", "Yanis", "ENFANT", "2015-05-05");

  return [
    person("karim", "Kadi", "Karim", "1985-01-01", [
      ad("Benali", soniaFirstNameOnKarimDossier, "CONJOINT", "1987-02-02"),
      lina,
      adam,
    ]),
    person("sonia", "Benali", "Sonia", "1987-02-02", [
      ad("Kadi", "Karim", "CONJOINT", "1985-01-01"),
      lina,
      adam,
      yanis,
    ]),
  ];
}

describe("computeStructureFamillesRow — spec example", () => {
  it("counts 2 identical conjoints, 1 crossed couple, partly common children", () => {
    const row = analyse(household("Sonia"));

    expect(row.structureId).toBe(1);
    expect(row.dossiers).toBe(2);
    expect(row.ayants_droit).toBe(7);
    expect(row.ayants_droit_conjoints).toBe(2);
    expect(row.ayants_droit_enfants).toBe(5);
    expect(row.dossiers_avec_conjoint).toBe(2);

    expect(row.conjoints_identiques).toBe(2);
    expect(row.conjoints_tres_proches).toBe(0);
    expect(row.conjoints_douteux).toBe(0);
    expect(row.conjoints_non_trouves).toBe(0);
    expect(row.conjoints_autre_structure).toBe(0);
    expect(row.conjoints_sans_date_naissance).toBe(0);

    expect(row.enfants_mineurs).toBe(5);
    expect(row.enfants_majeurs).toBe(0);

    expect(row.couples).toBe(1);
    expect(row.couples_croises).toBe(1);
    expect(row.couples_enfants_en_partie_communs).toBe(1);
    expect(row.couples_memes_enfants).toBe(0);
    expect(row.couples_sans_enfant).toBe(0);
    expect(row.enfants_comptes_deux_fois).toBe(2);
    expect(row.enfants_presents_deux_fois).toBe(2);
    expect(row.couples_avec_parent).toBe(0);

    expect(row.personnes_comptees_aujourdhui).toBe(9);
    expect(row.personnes_reelles_estimees).toBe(5);
    expect(row.gap_personnes).toBe(4);
    expect(row.gap_pourcentage).toBe(44);
    expect(cohortTotalsErrors(row)).toEqual([]);
  });

  it("still forms the couple when Sonia is typed 'Sonai' on Karim's dossier", () => {
    const row = analyse(household("Sonai"));

    expect(row.conjoints_identiques).toBe(1);
    expect(row.conjoints_tres_proches).toBe(1);
    expect(row.couples).toBe(1);
    expect(row.couples_croises).toBe(1);
    expect(row.personnes_reelles_estimees).toBe(5);
    expect(row.gap_personnes).toBe(4);
    expect(cohortTotalsErrors(row)).toEqual([]);
  });
});

describe("computeStructureFamillesRow — conjoint outcomes", () => {
  const alice = (conjoint: RawAd) =>
    person("a", "Martin", "Alice", "1980-06-06", [conjoint]);

  it("flags a conjoint that only has a dossier in another structure", () => {
    const row = analyse(
      [alice(ad("Martin", "Bob", "CONJOINT", "1982-07-07"))],
      [`1982-07-07|${normalizeCompareKey("Martin", "Bob")}`]
    );

    expect(row.conjoints_autre_structure).toBe(1);
    expect(row.conjoints_non_trouves).toBe(0);
    expect(row.couples).toBe(0);
  });

  it("counts a conjoint found nowhere as not-found", () => {
    const row = analyse([alice(ad("Martin", "Bob", "CONJOINT", "1982-07-07"))]);

    expect(row.conjoints_non_trouves).toBe(1);
    expect(row.conjoints_autre_structure).toBe(0);
  });

  it("keeps a conjoint with no birth date out of conjoints_non_trouves", () => {
    const row = analyse([alice(ad("Martin", "Bob", "CONJOINT", null))]);

    expect(row.conjoints_sans_date_naissance).toBe(1);
    expect(row.conjoints_non_trouves).toBe(0);
    expect(row.conjoints_autre_structure).toBe(0);
    expect(row.couples).toBe(0);
    expect(cohortTotalsErrors(row)).toEqual([]);
  });
});

describe("computeStructureFamillesRow — cohorts", () => {
  // One dossier declaring a dependant of every kind, plus the dossiers they
  // are looked up against.
  const dossiers = [
    person("paul", "Durand", "Paul", "1970-01-01", [
      // conjoints: one per bucket
      ad("Durand", "Anna", "CONJOINT", null),
      ad("Martin", "Alice", "CONJOINT", "1971-02-02"),
      ad("Dupont", "Bab", "CONJOINT", "1972-03-03"),
      ad("Durand", "De", "CONJOINT", "1973-04-04"),
      ad("Autre", "Personne", "CONJOINT", "1974-05-05"),
      ad("Nobody", "Here", "CONJOINT", "1975-06-06"),
      // enfants: no date, minor, then one adult per bucket
      ad("Durand", "Sans", "ENFANT", null),
      ad("Durand", "Petit", "ENFANT", "2018-01-01"),
      ad("Durand", "Luc", "ENFANT", "1999-01-01"),
      ad("Durand", "Lukas", "ENFANT", "2000-02-02"),
      ad("Durand", "Jo", "ENFANT", "2001-03-03"),
      ad("Durand", "Zoe", "ENFANT", "2002-04-04"),
      ad("Durand", "Eve", "ENFANT", "2003-05-05"),
      // a parent with a dossier, and someone else
      ad("Durand", "Jean", "PARENT", "1945-01-01"),
      ad("Durand", "Cousin", "AUTRE", "1980-01-01"),
    ]),
    person("alice", "Martin", "Alice", "1971-02-02"),
    person("bob", "Dupont", "Bob", "1972-03-03"),
    person("deborah", "Durand", "Deborah", "1973-04-04"),
    person("luc", "Durand", "Luc", "1999-01-01"),
    person("lucas", "Durand", "Lucas", "2000-02-02"),
    person("joseph", "Durand", "Joseph", "2001-03-03"),
    person("jean", "Durand", "Jean", "1945-01-01"),
  ];
  const elsewhere = [
    `1974-05-05|${normalizeCompareKey("Autre", "Personne")}`,
    `2002-04-04|${normalizeCompareKey("Durand", "Zoe")}`,
  ];

  it("splits every cohort into sub-groups that add up to its base", () => {
    const row = analyse(dossiers, elsewhere);

    expect(row.ayants_droit).toBe(15);
    expect(row.ayants_droit_conjoints).toBe(6);
    expect(row.ayants_droit_enfants).toBe(7);
    expect(row.ayants_droit_parents).toBe(1);
    expect(row.ayants_droit_autres).toBe(1);

    expect(row.conjoints_sans_date_naissance).toBe(1);
    expect(row.conjoints_identiques).toBe(1);
    expect(row.conjoints_tres_proches).toBe(1);
    expect(row.conjoints_douteux).toBe(1);
    expect(row.conjoints_autre_structure).toBe(1);
    expect(row.conjoints_non_trouves).toBe(1);

    expect(row.enfants_sans_date_naissance).toBe(1);
    expect(row.enfants_mineurs).toBe(1);
    expect(row.enfants_majeurs).toBe(5);

    expect(row.enfants_majeurs_identiques).toBe(1);
    expect(row.enfants_majeurs_tres_proches).toBe(1);
    expect(row.enfants_majeurs_douteux).toBe(1);
    expect(row.enfants_majeurs_autre_structure).toBe(1);
    expect(row.enfants_majeurs_non_trouves).toBe(1);

    expect(row.parents_avec_dossier).toBe(1);
    expect(cohortTotalsErrors(row)).toEqual([]);
  });

  it("merges the conjoints, adult children and parents that were found", () => {
    const row = analyse(dossiers, elsewhere);

    // found = identical or very close: 2 conjoints, 2 adult children, 1 parent
    expect(row.personnes_comptees_aujourdhui).toBe(8 + 15);
    expect(row.personnes_reelles_estimees).toBe(8 + 15 - 5);
    expect(row.gap_personnes).toBe(5);
  });

  it("reports a cohort whose sub-groups do not add up", () => {
    const row = new StructureFamillesRow(7);
    row.ayants_droit = 3;

    expect(cohortTotalsErrors(row)).toEqual([
      "ayants_droit=3 but ayants_droit_conjoints+ayants_droit_enfants+ayants_droit_parents+ayants_droit_autres=0",
    ]);
  });
});

describe("computeStructureFamillesRow — children declared on several dossiers", () => {
  it("counts a child declared by two dossiers that are not a couple", () => {
    const lina = ad("Kadi", "Lina", "ENFANT", "2010-03-03");
    const row = analyse([
      person("mother", "Kadi", "Sonia", "1987-02-02", [lina]),
      person("father", "Kadi", "Karim", "1985-01-01", [lina]),
    ]);

    expect(row.couples).toBe(0);
    expect(row.enfants_comptes_deux_fois).toBe(0);
    expect(row.enfants_presents_deux_fois).toBe(1);
    // 2 dossiers + 2 ayants droit, Lina counted twice
    expect(row.personnes_comptees_aujourdhui).toBe(4);
    expect(row.personnes_reelles_estimees).toBe(3);
  });

  it("counts one child once, whatever the number of dossiers declaring them", () => {
    const lina = ad("Kadi", "Lina", "ENFANT", "2010-03-03");
    const row = analyse([
      person("a", "Kadi", "Sonia", "1987-02-02", [lina]),
      person("b", "Kadi", "Karim", "1985-01-01", [lina]),
      person("c", "Kadi", "Nora", "1990-09-09", [lina]),
    ]);

    expect(row.enfants_presents_deux_fois).toBe(1);
    expect(row.gap_personnes).toBe(2);
  });

  it("does not link children with the same birth day but another name", () => {
    const row = analyse([
      person("a", "Kadi", "Sonia", "1987-02-02", [
        ad("Kadi", "Lina", "ENFANT", "2010-03-03"),
      ]),
      person("b", "Roy", "Paul", "1980-01-01", [
        ad("Roy", "Emma", "ENFANT", "2010-03-03"),
      ]),
    ]);

    expect(row.enfants_presents_deux_fois).toBe(0);
    expect(row.gap_personnes).toBe(0);
  });
});

describe("computeStructureFamillesRow — personnes_reelles_estimees dedup", () => {
  it("subtracts an adult child who also has their own dossier", () => {
    const row = analyse([
      person("henri", "Fort", "Henri", "1975-06-06", [
        ad("Fort", "Julie", "ENFANT", "2000-07-07"),
      ]),
      person("julie", "Fort", "Julie", "2000-07-07"),
    ]);

    expect(row.enfants_majeurs_identiques).toBe(1);
    // 2 dossiers + 1 ayant droit = 3 occurrences of 2 real people (Henri, Julie)
    expect(row.personnes_comptees_aujourdhui).toBe(3);
    expect(row.personnes_reelles_estimees).toBe(2);
    expect(row.gap_personnes).toBe(1);
  });

  it("subtracts a declared parent who also has their own dossier", () => {
    const row = analyse([
      person("paul", "Roy", "Paul", "1980-01-01", [
        ad("Roy", "Gerard", "PARENT", "1950-05-05"),
      ]),
      person("gerard", "Roy", "Gerard", "1950-05-05"),
    ]);

    expect(row.parents_avec_dossier).toBe(1);
    expect(row.personnes_comptees_aujourdhui).toBe(3);
    expect(row.personnes_reelles_estimees).toBe(2);
    expect(row.gap_personnes).toBe(1);
  });

  it("does not double-subtract a shared adult child who also has a dossier", () => {
    // Karim and Sonia are a couple; both declare their adult son Marc, who
    // also has his own dossier. Marc is one real person, declared 3 times
    // (his dossier + each parent's ayant droit): the excess is 2, not the sum
    // of every counter that saw him (1 shared child + 2 adult children = 3).
    const marc = ad("Kadi", "Marc", "ENFANT", "1995-01-01");
    const row = analyse([
      person("karim", "Kadi", "Karim", "1985-01-01", [
        ad("Benali", "Sonia", "CONJOINT", "1987-02-02"),
        marc,
      ]),
      person("sonia", "Benali", "Sonia", "1987-02-02", [
        ad("Kadi", "Karim", "CONJOINT", "1985-01-01"),
        marc,
      ]),
      person("marc", "Kadi", "Marc", "1995-01-01"),
    ]);

    expect(row.enfants_comptes_deux_fois).toBe(1);
    expect(row.enfants_presents_deux_fois).toBe(1);
    expect(row.enfants_majeurs_identiques).toBe(2);
    // 3 dossiers + 4 ayants droit = 7 occurrences of 3 real people
    expect(row.personnes_comptees_aujourdhui).toBe(7);
    expect(row.personnes_reelles_estimees).toBe(3);
    expect(row.gap_personnes).toBe(4);
    expect(cohortTotalsErrors(row)).toEqual([]);
  });
});

describe("FamillesAnalysisService.run", () => {
  // one structure, no usager anywhere: enough to reach the end of the run
  const queryRunner = {
    query: jest.fn(async (sql: string) =>
      sql.includes('FROM "structure"') ? [{ id: 1 }] : []
    ),
  } as unknown as QueryRunner;

  it("logs the full CSV before uploading, so a failed upload loses nothing", async () => {
    const uploadFile = jest.fn().mockRejectedValue(new Error("S3 down"));
    const service = new FamillesAnalysisService({
      uploadFile,
    } as unknown as FileManagerService);

    await expect(service.run(queryRunner)).rejects.toThrow("S3 down");

    const logged = (appLogger.warn as unknown as jest.Mock).mock.calls.map(
      ([message]) => String(message)
    );
    expect(logged.some((m) => m.includes("full CSV:\nstructureId,"))).toBe(
      true
    );
  });
});

describe("toCsv", () => {
  it("emits the header then one line per structure, in column order", () => {
    const row = analyse(household("Sonia"));
    const lines = toCsv([row]).trimEnd().split("\n");

    expect(lines[0]).toBe(FAMILLES_ANALYSIS_COLUMNS.join(","));
    expect(lines[1].split(",")[0]).toBe("1");
    expect(lines).toHaveLength(2);
  });

  it("writes a column for every counter of the row, none twice", () => {
    const counters = Object.keys(new StructureFamillesRow(1)).sort();

    expect([...FAMILLES_ANALYSIS_COLUMNS].sort()).toEqual(counters);
  });
});
