import { UsagerLight } from "../../../_common/model";
import { usagersSearchCache } from "./usagersSearchCache.service";

const initialState: Partial<UsagerLight>[] = [
  {
    uuid: "1",
    prenom: "John",
    nom: "Smith",
  },
  {
    uuid: "2",
    prenom: "Marie",
    nom: "Smith",
  },
  {
    uuid: "3",
    prenom: "Claire",
    nom: "Meunier",
  },
];

it("usagersSearchCache: set initial state", () => {
  expect(usagersSearchCache.getUsagersSnapshot()).toBeUndefined();
  usagersSearchCache.setUsagers(initialState as UsagerLight[]);
  expect(usagersSearchCache.getUsagersSnapshot()).toEqual(initialState);
});

it("usagersSearchCache: update", () => {
  usagersSearchCache.setUsagers(initialState as UsagerLight[]);
  usagersSearchCache.updateUsager({
    uuid: "2",
    prenom: "Maria",
    nom: "Smith",
  } as UsagerLight);
  expect(usagersSearchCache.getUsagersSnapshot()).toEqual([
    {
      uuid: "1",
      prenom: "John",
      nom: "Smith",
    },
    {
      uuid: "2",
      prenom: "Maria",
      nom: "Smith",
    },
    {
      uuid: "3",
      prenom: "Claire",
      nom: "Meunier",
    },
  ]);
});

it("usagersSearchCache: create", () => {
  usagersSearchCache.setUsagers(initialState as UsagerLight[]);
  usagersSearchCache.createUsager({
    uuid: "4",
    prenom: "Jo",
    nom: "Ker",
  } as UsagerLight);
  expect(usagersSearchCache.getUsagersSnapshot()).toEqual([
    {
      uuid: "1",
      prenom: "John",
      nom: "Smith",
    },
    {
      uuid: "2",
      prenom: "Marie",
      nom: "Smith",
    },
    {
      uuid: "3",
      prenom: "Claire",
      nom: "Meunier",
    },
    {
      uuid: "4",
      prenom: "Jo",
      nom: "Ker",
    },
  ]);
});

it("usagersSearchCache: remove by uuid", () => {
  usagersSearchCache.setUsagers(initialState as UsagerLight[]);

  usagersSearchCache.removeUsagersByCriteria({
    uuid: "2",
  });
  expect(usagersSearchCache.getUsagersSnapshot()).toEqual([
    {
      uuid: "1",
      prenom: "John",
      nom: "Smith",
    },
    {
      uuid: "3",
      prenom: "Claire",
      nom: "Meunier",
    },
  ]);
});

it("usagersSearchCache: remove by prenom", () => {
  usagersSearchCache.setUsagers(initialState as UsagerLight[]);

  usagersSearchCache.removeUsagersByCriteria({
    prenom: "Claire",
  });
  expect(usagersSearchCache.getUsagersSnapshot()).toEqual([
    {
      uuid: "1",
      prenom: "John",
      nom: "Smith",
    },
    {
      uuid: "2",
      prenom: "Marie",
      nom: "Smith",
    },
  ]);
});
