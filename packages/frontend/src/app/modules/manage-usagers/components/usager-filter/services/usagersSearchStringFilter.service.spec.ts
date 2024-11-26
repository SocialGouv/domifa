import { UsagerLight } from "../../../../../../_common/model";
import { usagersSearchStringFilter } from "./usagersSearchStringFilter.service";

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
] as unknown as UsagerLight[];

it("usagersSearchStringFilter ayantsDroits.prenom", () => {
  const results = usagersSearchStringFilter.filter(usagers, {
    searchString: "soph",
    searchStringField: "DEFAULT",
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(1);
});
it("usagersSearchStringFilter prenom", () => {
  const results = usagersSearchStringFilter.filter(usagers, {
    searchString: "marie",

    searchStringField: "DEFAULT",
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(2);
});

it("usagersSearchStringFilter surnom", () => {
  const results = usagersSearchStringFilter.filter(usagers, {
    searchString: "clacla",
    searchStringField: "DEFAULT",
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(3);
});
it("usagersSearchStringFilter customRef", () => {
  const results = usagersSearchStringFilter.filter(usagers, {
    searchString: "003",
    searchStringField: "DEFAULT",
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(3);
});

it("usagersSearchStringFilter procurations", () => {
  const results = usagersSearchStringFilter.filter(usagers, {
    searchString: "KoKo",
    searchStringField: "DEFAULT",
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(2);
});
