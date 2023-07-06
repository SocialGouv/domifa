import { DOMIFA_ADMIN_STRUCTURE_ID } from "../../../auth/services";
import { TestUserAdmin } from "../types";
import { TESTS_USERS_STRUCTURE } from "./TESTS_USERS_STRUCTURE.mock";

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
