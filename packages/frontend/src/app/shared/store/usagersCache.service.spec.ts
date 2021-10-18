import { UsagerLight } from "../../../_common/model";
import { usagersCache } from "./usagersCache.service";

const initialState: Partial<UsagerLight>[] = [
  {
    uuid: "1",
    ref: 1,
    prenom: "John",
    nom: "Smith",
  },
  {
    uuid: "2",
    ref: 2,
    prenom: "Marie",
    nom: "Smith",
  },
  {
    uuid: "3",
    ref: 3,
    prenom: "Claire",
    nom: "Meunier",
  },
];

it("usagersCache: set initial state", () => {
  expect(usagersCache.getSnapshot().allUsagers).toBeUndefined();
  usagersCache.setUsagers(initialState as UsagerLight[]);
  expect(usagersCache.getSnapshot().allUsagers).toEqual(initialState);
});

it("usagersCache: update", () => {
  usagersCache.setUsagers(initialState as UsagerLight[]);
  usagersCache.updateUsager({
    uuid: "2",
    ref: 2,
    prenom: "Maria",
    nom: "Smith",
  } as UsagerLight);
  expect(usagersCache.getSnapshot().allUsagers).toEqual([
    {
      uuid: "1",
      ref: 1,
      prenom: "John",
      nom: "Smith",
    },
    {
      uuid: "2",
      ref: 2,
      prenom: "Maria",
      nom: "Smith",
    },
    {
      uuid: "3",
      ref: 3,
      prenom: "Claire",
      nom: "Meunier",
    },
  ]);
});

it("usagersCache: create", () => {
  usagersCache.setUsagers(initialState as UsagerLight[]);
  usagersCache.createUsager({
    uuid: "4",
    ref: 4,
    prenom: "Jo",
    nom: "Ker",
  } as UsagerLight);
  expect(usagersCache.getSnapshot().allUsagers).toEqual([
    {
      uuid: "1",
      ref: 1,
      prenom: "John",
      nom: "Smith",
    },
    {
      uuid: "2",
      ref: 2,
      prenom: "Marie",
      nom: "Smith",
    },
    {
      uuid: "3",
      ref: 3,
      prenom: "Claire",
      nom: "Meunier",
    },
    {
      uuid: "4",
      ref: 4,
      prenom: "Jo",
      nom: "Ker",
    },
  ]);
});

it("usagersCache: remove by ref", () => {
  usagersCache.setUsagers(initialState as UsagerLight[]);

  usagersCache.removeUsager({
    ref: 2,
  });
  expect(usagersCache.getSnapshot().allUsagers).toEqual([
    {
      uuid: "1",
      ref: 1,
      prenom: "John",
      nom: "Smith",
    },
    {
      uuid: "3",
      ref: 3,
      prenom: "Claire",
      nom: "Meunier",
    },
  ]);
});
