import { UsagerLight } from "../../../../../../../_common/model";
import { usagersSorter } from "./usagersSorter.service";

const usagers = [
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
    decision: {
      dateFin: new Date(Date.UTC(2022, 8, 15)),
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
    decision: {
      dateFin: new Date(Date.UTC(2022, 6, 15)),
    },
  },
] as UsagerLight[];

it("usagersSorter NAME (nom, prenom)", () => {
  const results = usagersSorter.sortBy(usagers, {
    sortKey: "NAME",
    sortValue: "ascending",
  });
  expect(results.length).toEqual(usagers.length);
  expect(results[0].ref).toEqual(3);
  expect(results[1].ref).toEqual(1);
  expect(results[2].ref).toEqual(2);
});

it("usagersSorter RADIE (usager.decision.dateFin)", () => {
  const results = usagersSorter.sortBy(usagers, {
    sortKey: "RADIE",
    sortValue: "descending",
  });
  expect(results.length).toEqual(usagers.length);
  expect(results[0].ref).toEqual(2);
  expect(results[1].ref).toEqual(3);
  expect(results[2].ref).toEqual(1); // null last
});
