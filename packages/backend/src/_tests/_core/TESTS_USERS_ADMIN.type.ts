import { DOMIFA_ADMIN_STRUCTURE_ID } from "../../auth/services";
import { UserStructure } from "../../_common/model";
import { TESTS_USERS_STRUCTURE } from "./TESTS_USERS_STRUCTURE.type";

export type TestUserAdmin = Pick<
  UserStructure,
  "uuid" | "id" | "email" | "password"
>;

const ALL: TestUserAdmin[] = TESTS_USERS_STRUCTURE.ALL.filter(
  (x) => x.structureId === DOMIFA_ADMIN_STRUCTURE_ID && x.role === "admin"
);

const BY_EMAIL = ALL.reduce((acc, user) => {
  acc[user.email] = user;
  return acc;
}, {} as { [email: string]: TestUserAdmin });

export const TESTS_USERS_ADMIN = {
  ALL,
  BY_EMAIL,
};
