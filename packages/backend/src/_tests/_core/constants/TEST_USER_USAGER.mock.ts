import { TestUserUsager } from "../types";

const ALL: TestUserUsager[] = [
  {
    uuid: "27fae717-8d2f-4cdb-9e43-a0f64ee08362",
    usagerUUID: "b2c26e55-ab37-457d-b307-6fe161050a9b",
    structureId: 1,
    login: "WKYJBDXS",
    password: "Azerty012345!",
    passwordType: "PERSONAL",
  },
  {
    uuid: "a03a9a49-ae31-4160-9879-bab02dc46361",
    usagerUUID: "97b7e840-0e93-4bf4-ba7d-0a406aa898f2",
    structureId: 1,
    login: "LNQIFFBK",
    password: "Azerty012345!",
    passwordType: "RANDOM",
  },
];

const BY_USAGER_UUID = ALL.reduce((acc, user) => {
  acc[user.usagerUUID] = user;
  return acc;
}, {} as { [email: string]: TestUserUsager });

const BY_STRUCTURE_ID = ALL.reduce((acc, user) => {
  if (!acc[user.structureId]) {
    acc[user.structureId] = [];
  }
  acc[user.structureId].push(user);
  return acc;
}, {} as { [structureId: string]: TestUserUsager[] });

export const TESTS_USERS_USAGER = {
  ALL,
  BY_USAGER_UUID,
  BY_STRUCTURE_ID,
};
