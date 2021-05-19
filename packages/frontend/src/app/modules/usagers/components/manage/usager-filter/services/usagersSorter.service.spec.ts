import { UsagerLight } from "../../../../../../../_common/model";
import { usagersSorter } from "./usagersSorter.service";

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
      dateFin: new Date(Date.UTC(2022, 6, 15)),
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
      dateFin: new Date(Date.UTC(2021, 6, 15)),
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
      dateFin: new Date(Date.UTC(2021, 6, 16)),
    },
  },
] as UsagerLight[];

it("usagersSorter NAME (nom, prenom)", () => {
  const results = usagersSorter.sortBy(usagers, {
    sortKey: "NAME",
    sortValue: "ascending",
  });
  expect(results.length).toEqual(usagers.length);
  expect(results.map((x) => x.ref)).toEqual([3, 5, 4, 1, 2]);
});

it("usagersSorter RADIE (usager.decision.dateFin)", () => {
  const results = usagersSorter.sortBy(usagers, {
    sortKey: "RADIE",
    sortValue: "descending",
  });
  expect(results.length).toEqual(usagers.length);
  expect(results.map((x) => x.ref)).toEqual([2, 3, 5, 4, 1]); // null last
});

it("usagersSorter customRef asc", () => {
  const results = usagersSorter.sortBy(usagers, {
    sortKey: "ID",
    sortValue: "ascending",
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
    sortValue: "descending",
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
