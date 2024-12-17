import { UsagerLight } from "../../../../../../_common/model";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { usagersSorter } from "./usagersSorter.service";

const usagersMock = [
  {
    ref: 1,
    prenom: "John",
    nom: "Smith",
    email: "john21@provider1.com",
    customRef: "001",
    ayantsDroits: [
      {
        prenom: "Sarah",
        nom: "Smith",
      },
      {
        prenom: "Sophie",
        nom: "Smith",
      },
    ],
    options: {
      procurations: [{ nom: "Mamadou", prenom: "Sacko" }],
    },
  },
  {
    ref: 2,
    prenom: "Marie",
    nom: "Smith",
    surnom: "Maria",
    email: "marie222@provider1.com",
    ayantsDroits: [
      {
        prenom: "John",
        nom: "Smith",
      },
    ],

    options: {
      procurations: [
        { nom: "Zazie", prenom: "Koko" },
        { nom: "Youlo", prenom: "Koko" },
      ],
    },
  },
  {
    ref: 3,
    prenom: "Claire",
    nom: "Meunier",
    surnom: "Clacla",
    email: "claire.meunier@vprovider2.org",
    customRef: "003",
    ayantsDroits: [],
    options: {
      procurations: [],
    },
  },
].map((usager) => new UsagerFormModel(usager as UsagerLight));
const usagers = [
  {
    ref: 1,
    customRef: "01",
    prenom: "John",
    nom: "Smith",
    email: "john21@provider1.com",
    ayantsDroits: [
      {
        prenom: "Sarah",
        nom: "Smith",
      },
      {
        prenom: "Sophie",
        nom: "Smith",
      },
    ],
    decision: {
      statut: "RADIE",
      dateFin: new Date(Date.UTC(2022, 8, 14)),
    },
  },
  {
    ref: 2,
    customRef: "50",
    prenom: "Marie",
    nom: "Smith",
    surnom: "Maria",
    email: "marie222@provider1.com",
    ayantsDroits: [
      {
        prenom: "John",
        nom: "Smith",
      },
    ],
    decision: {
      statut: "RADIE",
      dateFin: new Date(Date.UTC(2022, 8, 15)),
    },
  },
  {
    ref: 3,
    customRef: "8",
    prenom: "Claire",
    nom: "Meunier",
    surnom: "Clacla",
    email: "claire.meunier@vprovider2.org",
    ayantsDroits: [],
    decision: {
      statut: "INSTRUCTION",
    },
  },
  {
    ref: 4,
    customRef: "Ab6",
    prenom: "Toto",
    nom: "Meunier",
    surnom: undefined,
    email: undefined,
    ayantsDroits: [],
    decision: {
      statut: "RADIE",
      dateFin: new Date(Date.UTC(2023, 6, 15)),
    },
  },
  {
    ref: 5,
    customRef: "AB5",
    prenom: "Sophie",
    nom: "meunier",
    surnom: undefined,
    email: undefined,
    ayantsDroits: [],
    decision: {
      statut: "RADIE",
      dateFin: new Date(Date.UTC(2023, 6, 16)),
    },
  },
].map((usager) => new UsagerFormModel(usager as UsagerLight));

describe("usagersSorter - test from legacy code", () => {
  it("usagersSorter NOM (nom, prenom)", () => {
    const results = usagersSorter.sortBy(usagers, {
      sortKey: "NOM",
      sortValue: "asc",
    });
    expect(results.length).toEqual(usagers.length);
    expect(results.map((x) => x.ref)).toEqual([3, 5, 4, 1, 2]);
  });

  it("usagersSorter RADIE (usager.decision.dateFin)", () => {
    const results = usagersSorter.sortBy(usagers, {
      sortKey: "ECHEANCE",
      sortValue: "desc",
    });
    expect(results.length).toEqual(usagers.length);
    expect(
      results.map((x) => {
        return x.ref;
      })
    ).toEqual([5, 4, 2, 1, 3]); // null last
  });

  it("usagersSorter customRef asc", () => {
    const results = usagersSorter.sortBy(usagers, {
      sortKey: "ID",
      sortValue: "asc",
    });
    expect(results.length).toEqual(usagers.length);
    expect(results.map((x) => x.customRef)).toEqual([
      "01",
      "8",
      "50",
      "AB5",
      "Ab6",
    ]);
  });

  it("usagersSorter customRef desc", () => {
    const results = usagersSorter.sortBy(usagers, {
      sortKey: "ID",
      sortValue: "desc",
    });
    expect(results.length).toEqual(usagers.length);
    expect(results.map((x) => x.customRef)).toEqual([
      "Ab6",
      "AB5",
      "50",
      "8",
      "01",
    ]);
  });
});

describe("usagersSorter", () => {
  const baseUsagers = [...usagersMock] as UsagerLight[];

  describe("sortBy avec tri par défaut (nom, prénom, ref)", () => {
    it("devrait trier par nom en ordre ascendant par défaut", () => {
      const result = usagersSorter.sortBy(baseUsagers, {
        sortKey: "NOM",
        sortValue: "asc",
      });

      expect(result.map((u) => u.nom)).toEqual(["Meunier", "Smith", "Smith"]);
    });

    it("devrait trier par nom en ordre descendant", () => {
      const result = usagersSorter.sortBy(baseUsagers, {
        sortKey: "NOM",
        sortValue: "desc",
      });

      expect(result.map((u) => u.nom)).toEqual(["Smith", "Smith", "Meunier"]);
    });

    it("devrait utiliser le prénom comme second critère de tri", () => {
      const result = usagersSorter.sortBy(baseUsagers, {
        sortKey: "NOM",
        sortValue: "asc",
      });

      // Vérifier que les Smith sont triés par prénom
      const smiths = result.filter((u) => u.nom === "Smith");
      expect(smiths.map((u) => u.prenom)).toEqual(["John", "Marie"]);
    });
  });

  describe("sortBy avec tri par ID (customRef)", () => {
    it("devrait trier les 'ref' numériques avant les non-numériques en asc", () => {
      const result = usagersSorter.sortBy(baseUsagers, {
        sortKey: "ID",
        sortValue: "asc",
      });

      expect(result.map((u) => u.ref)).toEqual([1, 2, 3]);
    });

    it("devrait trier les 'ref' numériques après les non-numériques en desc", () => {
      const result = usagersSorter.sortBy(baseUsagers, {
        sortKey: "ID",
        sortValue: "desc",
      });

      expect(result.map((u) => u.ref)).toEqual([3, 2, 1]);
    });

    // Test avec un jeu de données plus complexe
    it("devrait gérer correctement un mix de formats de références", () => {
      const mixedRefUsagers = [
        { ...baseUsagers[0], customRef: "123" },
        { ...baseUsagers[1], customRef: "ABC" },
        { ...baseUsagers[2], customRef: "456" },
      ] as UsagerLight[];

      const result = usagersSorter.sortBy(mixedRefUsagers, {
        sortKey: "ID",
        sortValue: "asc",
      });

      expect(result.map((u) => u.customRef)).toEqual(["123", "456", "ABC"]);
    });
  });

  describe("sortBy avec valeurs nulles/manquantes", () => {
    const usagersWithNulls = [
      { ...baseUsagers[0], echeanceInfos: { dateToDisplay: "2024-01-01" } },
      { ...baseUsagers[1], echeanceInfos: null },
      { ...baseUsagers[2], echeanceInfos: { dateToDisplay: "2024-02-01" } },
    ] as UsagerLight[];

    it("devrait placer les valeurs nulles en premier en tri ascendant", () => {
      const result = usagersSorter.sortBy(usagersWithNulls, {
        sortKey: "ECHEANCE",
        sortValue: "asc",
      });

      expect(result.map((u) => u.echeanceInfos?.dateToDisplay)).toEqual([
        undefined,
        "2024-01-01",
        "2024-02-01",
      ]);
    });

    it("devrait placer les valeurs nulles en dernier en tri descendant", () => {
      const result = usagersSorter.sortBy(usagersWithNulls, {
        sortKey: "ECHEANCE",
        sortValue: "desc",
      });

      expect(result.map((u) => u.echeanceInfos?.dateToDisplay)).toEqual([
        "2024-02-01",
        "2024-01-01",
        undefined,
      ]);
    });
  });

  // Tests spécifiques pour les dates
  describe("sortBy avec dates", () => {
    const usagersWithDates = [
      {
        ...baseUsagers[0],
        lastInteraction: { dateInteraction: new Date("2024-01-15") },
      },
      {
        ...baseUsagers[1],
        lastInteraction: { dateInteraction: new Date("2024-01-01") },
      },
      {
        ...baseUsagers[2],
        lastInteraction: { dateInteraction: new Date("2024-02-01") },
      },
    ] as UsagerLight[];

    it("devrait trier les dates correctement en ordre ascendant", () => {
      const result = usagersSorter.sortBy(usagersWithDates, {
        sortKey: "PASSAGE",
        sortValue: "asc",
      });

      expect(result.map((u) => u.lastInteraction.dateInteraction)).toEqual([
        new Date("2024-01-01"),
        new Date("2024-01-15"),
        new Date("2024-02-01"),
      ]);
    });
  });
});
