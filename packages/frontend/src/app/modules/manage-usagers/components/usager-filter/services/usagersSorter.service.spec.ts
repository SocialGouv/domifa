import { UsagerLight } from "../../../../../../_common/model";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
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
    decision: {
      statut: "RADIE",
      dateFin: new Date(Date.UTC(2022, 8, 15)),
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
      dateFin: new Date(Date.UTC(2022, 6, 25)),
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

it("usagersSorter NAME (nom, prenom)", () => {
  const results = usagersSorter.sortBy(usagers, {
    sortKey: "NAME",
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
      console.log({ dateToDisplay: x.echeanceInfos.dateToDisplay, ref: x.ref });
      return x.ref;
    })
  ).toEqual([5, 4, 1, 2, 3]); // null last
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
