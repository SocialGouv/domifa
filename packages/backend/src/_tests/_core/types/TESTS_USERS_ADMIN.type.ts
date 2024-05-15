import { UserStructure } from "@domifa/common";

// NOTE: les profils de test sont aussi documentés dans le fichier "31_tests-users.md"

export type TestUserAdmin = Pick<
  UserStructure,
  "uuid" | "id" | "email" | "password"
>;
