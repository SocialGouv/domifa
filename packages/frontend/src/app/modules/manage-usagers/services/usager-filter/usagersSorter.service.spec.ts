import { UsagerOptionsProcuration } from "@domifa/common";
import { UsagerLight } from "../../../../../_common/model";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
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
      procurations: [
        new UsagerOptionsProcuration({ nom: "Mamadou", prenom: "Sacko" }),
      ],
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
  {
    ref: 4,
    prenom: "Toto",
    nom: "Mariec",
    surnom: "Clacla",
    email: "",
    customRef: "3A",
    ayantsDroits: [],
    options: {
      procurations: [],
    },
  },
].map((usager) => new UsagerFormModel(usager as UsagerLight));

describe("usagersSorter", () => {
  const baseUsagers = [...usagersMock] as UsagerLight[];

  describe("sortBy avec tri par défaut (nom, prénom, ref)", () => {
    it("devrait trier par nom en ordre ascendant par défaut", () => {
      const result = usagersSorter.sortBy(baseUsagers, {
        sortKey: "NOM",
        sortValue: "asc",
      });

      expect(result.map((u) => u.nom)).toEqual([
        "Mariec",
        "Meunier",
        "Smith",
        "Smith",
      ]);
    });

    it("devrait trier par nom en ordre descendant", () => {
      const result = usagersSorter.sortBy(baseUsagers, {
        sortKey: "NOM",
        sortValue: "desc",
      });

      expect(result.map((u) => u.nom)).toEqual([
        "Smith",
        "Smith",
        "Meunier",
        "Mariec",
      ]);
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
    it("devrait trier les 'ref' numériques avant les non-numériques en asc / Desc", () => {
      const tests = [
        { ref: 1, customRef: "A1", nom: "X", prenom: "CC" },
        { ref: 2, customRef: null, nom: "X", prenom: "CC" },
        { ref: 9, customRef: "22", nom: "X", prenom: "CC" },
        { ref: 3, customRef: "A333", nom: "X", prenom: "CC" },
        { ref: 4, customRef: "03", nom: "X", prenom: "CC" },
        { ref: 5, customRef: "1", nom: "X", prenom: "CC" },
        { ref: 6, customRef: "11", nom: "X", prenom: "CC" },
        { ref: 7, customRef: "111", nom: "X", prenom: "CC" },
        { ref: 10, customRef: "1-22", nom: "X", prenom: "CC" },
      ] as UsagerLight[];

      const asc = usagersSorter.sortBy(tests, {
        sortKey: "ID",
        sortValue: "asc",
      });

      expect(asc.map((u) => u.customRef)).toEqual([
        "1",
        null, // ici c'est 2 qui est prit en compte
        "03",
        "11",
        "22",
        "111",
        "1-22",
        "A1",
        "A333",
      ]);
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
