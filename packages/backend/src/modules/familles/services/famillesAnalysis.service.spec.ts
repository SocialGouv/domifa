import {
  computeStructureFamillesRow,
  toCsv,
  toDossierLite,
  UsagerRawRow,
} from "./famillesAnalysis.service";
import { FAMILLES_ANALYSIS_COLUMNS } from "../constants/FAMILLES_ANALYSIS.const";

// Spec example: Karim declares Sonia (conjoint), Lina, Adam.
// Sonia declares Karim (conjoint), Lina, Adam, Yanis.
function household(soniaFirstNameOnKarimDossier: string): UsagerRawRow[] {
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
    const dossiers = household("Sonia").map(toDossierLite);
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
    const dossiers = household("Sonai").map(toDossierLite);
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
    dob: string,
    ayantsDroits: UsagerRawRow["ayantsDroits"] = []
  ): UsagerRawRow => ({
    uuid,
    nom: "Martin",
    prenom,
    dateNaissance: new Date(`${dob}T12:00:00.000Z`),
    ayantsDroits,
  });

  it("flags a conjoint that only has a dossier in another structure", () => {
    const rows = [
      dossier("a", "Alice", "1980-06-06", [
        {
          nom: "Martin",
          prenom: "Bob",
          lien: "CONJOINT",
          dateNaissance: "1982-07-07",
        },
      ]),
    ].map(toDossierLite);

    const elsewhere = new Set<string>(["1982-07-07|martin|bob"]);
    const row = computeStructureFamillesRow(1, rows, elsewhere);

    expect(row.conjoints_autre_structure).toBe(1);
    expect(row.conjoints_non_trouves).toBe(0);
    expect(row.couples).toBe(0);
  });

  it("counts a conjoint found nowhere as non_trouve", () => {
    const rows = [
      dossier("a", "Alice", "1980-06-06", [
        {
          nom: "Martin",
          prenom: "Bob",
          lien: "CONJOINT",
          dateNaissance: "1982-07-07",
        },
      ]),
    ].map(toDossierLite);

    const row = computeStructureFamillesRow(1, rows, new Set());
    expect(row.conjoints_non_trouves).toBe(1);
    expect(row.conjoints_autre_structure).toBe(0);
  });
});

describe("toCsv", () => {
  it("emits the header then one line per structure, in column order", () => {
    const dossiers = household("Sonia").map(toDossierLite);
    const row = computeStructureFamillesRow(42, dossiers, new Set());
    const csv = toCsv([row]);
    const lines = csv.trimEnd().split("\n");

    expect(lines[0]).toBe(FAMILLES_ANALYSIS_COLUMNS.join(","));
    expect(lines[1].split(",")[0]).toBe("42");
    expect(lines).toHaveLength(2);
  });
});
