import { UserStructureRole } from "./../../../_common/model/user-structure/UserStructureRole.type";
import { FindOptionsWhere } from "typeorm";
import { DOMIFA_ADMIN_STRUCTURE_ID } from "../../../auth/services";
import { UserStructureTable } from "../../entities";

export const USER_ADMIN_WHERE: FindOptionsWhere<Partial<UserStructureTable>> = {
  role: "admin" as UserStructureRole,
  structureId: DOMIFA_ADMIN_STRUCTURE_ID,
};
