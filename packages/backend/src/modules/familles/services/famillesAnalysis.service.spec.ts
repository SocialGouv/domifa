import {
  computeStructureFamillesRow,
  toCsv,
  toDossierLight,
  UsagerRow,
} from "./famillesAnalysis.service";
import { FAMILLES_ANALYSIS_COLUMNS } from "../constants/FAMILLES_ANALYSIS.const";

// Spec example: Karim declares Sonia (conjoint), Lina, Adam.
// Sonia declares Karim (conjoint), Lina, Adam, Yanis.
function household(soniaFirstNameOnKarimDossier: string): UsagerRow[] {
  const lina = {
    nom: "Kadi",
    prenom: "Lina",
    lien: "ENFANT" as const,
    dateNaissance: "2010-03-03",
  };
  const adam = {
    nom: "Kadi",
    prenom: "Adam",
    lien: "ENFANT" as const,
    dateNaissance: "2012-04-04",
  };
  const yanis = {
    nom: "Kadi",
    prenom: "Yanis",
    lien: "ENFANT" as const,
    dateNaissance: "2015-05-05",
  };

  return [
    {
      uuid: "karim",
      nom: "Kadi",
      prenom: "Karim",
      dateNaissance: new Date("1985-01-01T12:00:00.000Z"),
      ayantsDroits: [
        {
          nom: "Benali",
          prenom: soniaFirstNameOnKarimDossier,
          lien: "CONJOINT",
          dateNaissance: "1987-02-02",
        },
        lina,
        adam,
      ],
    },
    {
      uuid: "sonia",
      nom: "Benali",
      prenom: "Sonia",
      dateNaissance: new Date("1987-02-02T12:00:00.000Z"),
      ayantsDroits: [
        {
          nom: "Kadi",
          prenom: "Karim",
          lien: "CONJOINT",
          dateNaissance: "1985-01-01",
        },
        lina,
        adam,
        yanis,
      ],
    },
  ];
}

describe("computeStructureFamillesRow — spec example", () => {
  it("counts 2 identical conjoints, 1 crossed couple, partly common children", () => {
    const dossiers = household("Sonia").map(toDossierLight);
    const row = computeStructureFamillesRow(42, dossiers, new Set());

    expect(row.structureId).toBe(42);
    expect(row.dossiers).toBe(2);
    expect(row.ayants_droit).toBe(7);
    expect(row.ayants_droit_sans_date_naissance).toBe(0);
    expect(row.dossiers_avec_conjoint).toBe(2);

    expect(row.conjoints_identiques).toBe(2);
    expect(row.conjoints_tres_proches).toBe(0);
    expect(row.conjoints_douteux).toBe(0);
    expect(row.conjoints_non_trouves).toBe(0);
    expect(row.conjoints_autre_structure).toBe(0);

    expect(row.couples).toBe(1);
    expect(row.couples_croises).toBe(1);
    expect(row.couples_enfants_en_partie_communs).toBe(1);
    expect(row.couples_memes_enfants).toBe(0);
    expect(row.couples_sans_enfant).toBe(0);
    expect(row.enfants_comptes_deux_fois).toBe(2);
    expect(row.couples_avec_parent).toBe(0);

    expect(row.personnes_comptees_aujourdhui).toBe(9);
    expect(row.personnes_reelles_estimees).toBe(5);
    expect(row.gap_personnes).toBe(4);
    expect(row.gap_pourcentage).toBe(44);
  });

  it("still forms the couple when Sonia is typed 'Sonai' on Karim's dossier", () => {
    const dossiers = household("Sonai").map(toDossierLight);
    const row = computeStructureFamillesRow(42, dossiers, new Set());

    expect(row.conjoints_identiques).toBe(1);
    expect(row.conjoints_tres_proches).toBe(1);
    expect(row.couples).toBe(1);
    expect(row.couples_croises).toBe(1);
    expect(row.personnes_reelles_estimees).toBe(5);
    expect(row.gap_personnes).toBe(4);
  });
});

describe("computeStructureFamillesRow — conjoint outcomes", () => {
  const dossier = (
    uuid: string,
    prenom: string,
    day: string,
    ayantsDroits: UsagerRow["ayantsDroits"] = []
  ): UsagerRow => ({
    uuid,
    nom: "Martin",
    prenom,
    dateNaissance: new Date(`${day}T12:00:00.000Z`),
    ayantsDroits,
  });

  it("flags a conjoint that only has a dossier in another structure", () => {
    const dossiers = [
      dossier("a", "Alice", "1980-06-06", [
        {
          nom: "Martin",
          prenom: "Bob",
          lien: "CONJOINT",
          dateNaissance: "1982-07-07",
        },
      ]),
    ].map(toDossierLight);

    const elsewhere = new Set<string>(["1982-07-07|martin|bob"]);
    const row = computeStructureFamillesRow(1, dossiers, elsewhere);

    expect(row.conjoints_autre_structure).toBe(1);
    expect(row.conjoints_non_trouves).toBe(0);
    expect(row.couples).toBe(0);
  });

  it("counts a conjoint found nowhere as not-found", () => {
    const dossiers = [
      dossier("a", "Alice", "1980-06-06", [
        {
          nom: "Martin",
          prenom: "Bob",
          lien: "CONJOINT",
          dateNaissance: "1982-07-07",
        },
      ]),
    ].map(toDossierLight);

    const row = computeStructureFamillesRow(1, dossiers, new Set());
    expect(row.conjoints_non_trouves).toBe(1);
    expect(row.conjoints_autre_structure).toBe(0);
  });

  it("keeps a conjoint with no birth date out of conjoints_non_trouves", () => {
    const dossiers = [
      dossier("a", "Alice", "1980-06-06", [
        {
          nom: "Martin",
          prenom: "Bob",
          lien: "CONJOINT",
          dateNaissance: null as unknown as string,
        },
      ]),
    ].map(toDossierLight);

    const row = computeStructureFamillesRow(1, dossiers, new Set());
    expect(row.conjoints_sans_date_naissance).toBe(1);
    expect(row.conjoints_non_trouves).toBe(0);
    expect(row.conjoints_autre_structure).toBe(0);
    expect(row.couples).toBe(0);
  });
});

describe("computeStructureFamillesRow — personnes_reelles_estimees dedup", () => {
  it("subtracts an adult child who also has their own dossier", () => {
    const dossiers = [
      {
        uuid: "henri",
        nom: "Fort",
        prenom: "Henri",
        dateNaissance: new Date("1975-06-06T12:00:00.000Z"),
        ayantsDroits: [
          {
            nom: "Fort",
            prenom: "Julie",
            lien: "ENFANT" as const,
            dateNaissance: "2000-07-07", // adult
          },
        ],
      },
      {
        uuid: "julie",
        nom: "Fort",
        prenom: "Julie",
        dateNaissance: new Date("2000-07-07T12:00:00.000Z"),
        ayantsDroits: [],
      },
    ].map(toDossierLight);

    const row = computeStructureFamillesRow(1, dossiers, new Set());

    expect(row.enfants_majeurs_avec_dossier).toBe(1);
    // 2 dossiers + 1 ayant droit = 3 occurrences of 2 real people (Henri, Julie)
    expect(row.personnes_comptees_aujourdhui).toBe(3);
    expect(row.personnes_reelles_estimees).toBe(2);
    expect(row.gap_personnes).toBe(1);
  });

  it("subtracts a declared parent who also has their own dossier", () => {
    const dossiers = [
      {
        uuid: "paul",
        nom: "Roy",
        prenom: "Paul",
        dateNaissance: new Date("1980-01-01T12:00:00.000Z"),
        ayantsDroits: [
          {
            nom: "Roy",
            prenom: "Gerard",
            lien: "PARENT" as const,
            dateNaissance: "1950-05-05",
          },
        ],
      },
      {
        uuid: "gerard",
        nom: "Roy",
        prenom: "Gerard",
        dateNaissance: new Date("1950-05-05T12:00:00.000Z"),
        ayantsDroits: [],
      },
    ].map(toDossierLight);

    const row = computeStructureFamillesRow(1, dossiers, new Set());

    expect(row.parents_avec_dossier).toBe(1);
    expect(row.personnes_comptees_aujourdhui).toBe(3);
    expect(row.personnes_reelles_estimees).toBe(2);
    expect(row.gap_personnes).toBe(1);
  });

  it("does not double-subtract a shared adult child who also has a dossier", () => {
    // Karim and Sonia are a couple; both declare their adult son Marc, who
    // also has his own dossier. Marc is one real person, declared 3 times
    // (his dossier + each parent's ayant droit) — the excess is 2, not
    // enfants_comptes_deux_fois + enfants_majeurs_avec_dossier (1 + 2 = 3),
    // which would overcorrect.
    const marc = {
      nom: "Kadi",
      prenom: "Marc",
      lien: "ENFANT" as const,
      dateNaissance: "1995-01-01",
    };
    const dossiers = [
      {
        uuid: "karim",
        nom: "Kadi",
        prenom: "Karim",
        dateNaissance: new Date("1985-01-01T12:00:00.000Z"),
        ayantsDroits: [
          {
            nom: "Benali",
            prenom: "Sonia",
            lien: "CONJOINT" as const,
            dateNaissance: "1987-02-02",
          },
          marc,
        ],
      },
      {
        uuid: "sonia",
        nom: "Benali",
        prenom: "Sonia",
        dateNaissance: new Date("1987-02-02T12:00:00.000Z"),
        ayantsDroits: [
          {
            nom: "Kadi",
            prenom: "Karim",
            lien: "CONJOINT" as const,
            dateNaissance: "1985-01-01",
          },
          marc,
        ],
      },
      {
        uuid: "marc",
        nom: "Kadi",
        prenom: "Marc",
        dateNaissance: new Date("1995-01-01T12:00:00.000Z"),
        ayantsDroits: [],
      },
    ].map(toDossierLight);

    const row = computeStructureFamillesRow(1, dossiers, new Set());

    expect(row.enfants_comptes_deux_fois).toBe(1);
    expect(row.enfants_majeurs_avec_dossier).toBe(2);
    // 3 dossiers + 4 ayants droit = 7 occurrences of 3 real people
    expect(row.personnes_comptees_aujourdhui).toBe(7);
    expect(row.personnes_reelles_estimees).toBe(3);
    expect(row.gap_personnes).toBe(4);
  });
});

describe("toCsv", () => {
  it("emits the header then one line per structure, in column order", () => {
    const dossiers = household("Sonia").map(toDossierLight);
    const row = computeStructureFamillesRow(42, dossiers, new Set());
    const csv = toCsv([row]);
    const lines = csv.trimEnd().split("\n");

    expect(lines[0]).toBe(FAMILLES_ANALYSIS_COLUMNS.join(","));
    expect(lines[1].split(",")[0]).toBe("42");
    expect(lines).toHaveLength(2);
  });
});
