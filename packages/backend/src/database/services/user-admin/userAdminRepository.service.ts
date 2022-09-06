import { UserStructureRole } from "./../../../_common/model/user-structure/UserStructureRole.type";
import { FindOptionsWhere } from "typeorm";
import { DOMIFA_ADMIN_STRUCTURE_ID } from "../../../auth/services";

import { UserStructureTable } from "../../entities";
import { myDataSource } from "../_postgres";

// Note: pour l'instant, les user admin sont des stockés dans la table UserStructure. Ce sont les users de la structure 1 dont le role est "admin".
export const USER_ADMIN_PROFILE_ATTRIBUTES: (keyof UserStructureTable)[] = [
  "uuid",
  "createdAt",
  "updatedAt",
  "version",
  "id",
  "prenom",
  "nom",
  "email",
];

export const userAdminRepository =
  myDataSource.getRepository(UserStructureTable);

export const USER_ADMIN_WHERE: FindOptionsWhere<Partial<UserStructureTable>> = {
  role: "admin" as UserStructureRole,
  structureId: DOMIFA_ADMIN_STRUCTURE_ID,
};
