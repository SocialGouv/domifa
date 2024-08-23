import { UsagersFilterCriteria } from ".";
import { UsagerLight } from "../../../../../_common/model";
import { usagersFilter } from "./usagersFilter.service";

const usagers: UsagerLight[] = [
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
    decision: {
      statut: "VALIDE",
    },
    statut: "VALIDE",

    options: {
      procurations: [
        { nom: "Zazie", prenom: "Koko" },
        { nom: "Youlo", prenom: "Koko" },
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

    statut: "RADIE",
    decision: {
      statut: "RADIE",
    },
    options: {
      procurations: [],
    },
  },
  {
    ref: 3,
    prenom: "Claire",
    nom: "Meunier",
    surnom: "Clacla",
    email: "claire.meunier@vprovider2.org",
    customRef: "003",
    children: [],
    statut: "VALIDE",
    decision: {
      statut: "VALIDE",
    },

    ayantsDroits: [],
    options: {
      procurations: [
        { nom: "Zazie", prenom: "Koko" },
        { nom: "Youlo", prenom: "Koko" },
      ],
    },
  },
] as UsagerLight[];

it("usagersFilter searchString+statut", () => {
  const results = usagersFilter.filter(usagers, {
    criteria: new UsagersFilterCriteria({
      searchString: "mit",
      statut: "VALIDE",
    }),
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(1);
});
