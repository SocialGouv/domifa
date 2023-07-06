import { UserUsager } from "../../../_common/model";

// NOTE: les profils de test sont aussi documentés dans le fichier "31_tests-users.md"

export type TestUserUsager = Pick<
  UserUsager,
  | "uuid"
  | "usagerUUID"
  | "structureId"
  | "login"
  | "password"
  | "isTemporaryPassword"
>;
