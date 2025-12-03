import { StructureTable, UserStructureTable } from "../../../database";

export type UserStructureBrevo = Pick<
  UserStructureTable,
  "prenom" | "nom" | "id" | "role" | "email" | "lastLogin" | "createdAt"
> & {
  structure: Pick<
    StructureTable,
    "nom" | "departement" | "region" | "lastLogin"
  >;
};
