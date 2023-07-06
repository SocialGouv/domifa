import { UserStructure } from "../../../_common/model";

// NOTE: les profils de test sont aussi documentés dans le fichier "31_tests-users.md"

export type TestUserStructure = Pick<
  UserStructure,
  "uuid" | "id" | "structureId" | "email" | "role" | "password"
>;
