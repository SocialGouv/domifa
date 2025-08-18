// NOTE: les profils de test sont aussi documentés dans le fichier "31_tests-users.md"

import { UserUsager } from "@domifa/common";

export type TestUserUsager = Pick<
  UserUsager,
  "uuid" | "usagerUUID" | "structureId" | "login" | "password" | "passwordType"
>;
