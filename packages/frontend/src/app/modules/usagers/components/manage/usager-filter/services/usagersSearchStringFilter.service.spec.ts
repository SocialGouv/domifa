import { UsagerLight } from "../../../../../../../_common/model";
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
  },
  {
    ref: 3,
    prenom: "Claire",
    nom: "Meunier",
    surnom: "Clacla",
    email: "claire.meunier@vprovider2.org",
    customRef: "003",
    ayantsDroits: [],
  },
] as UsagerLight[];

it("usagersSearchStringFilter ayantsDroits.prenom", () => {
  const results = usagersSearchStringFilter.filter(usagers, {
    searchString: "soph",
    searchInAyantDroits: true,
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(1);
});
it("usagersSearchStringFilter prenom", () => {
  const results = usagersSearchStringFilter.filter(usagers, {
    searchString: "marie",
    searchInAyantDroits: true,
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(2);
});
// it("usagersSearchStringFilter email", () => {
//   const results = usagersSearchStringFilter.filter(usagers, {
//     searchString: "provider1.com",
//     searchInAyantDroits: true,
//   });
//   expect(results.length).toEqual(2);
// });
it("usagersSearchStringFilter surnom", () => {
  const results = usagersSearchStringFilter.filter(usagers, {
    searchString: "clacla",
    searchInAyantDroits: true,
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(3);
});
it("usagersSearchStringFilter customRef", () => {
  const results = usagersSearchStringFilter.filter(usagers, {
    searchString: "003",
    searchInAyantDroits: true,
  });
  expect(results.length).toEqual(1);
  expect(results[0].ref).toEqual(3);
});
