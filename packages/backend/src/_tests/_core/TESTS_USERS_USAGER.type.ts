import { UserUsager } from "../../_common/model";

export type TestUserUsager = Pick<
  UserUsager,
  "uuid" | "usagerUUID" | "structureId" | "login" | "password"
>;

const ALL: TestUserUsager[] = [
  {
    uuid: "27fae717-8d2f-4cdb-9e43-a0f64ee08362",
    usagerUUID: "b2c26e55-ab37-457d-b307-6fe161050a9b",
    structureId: 1,
    login: "WKYJBDXS",
    password: "63635285",
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
