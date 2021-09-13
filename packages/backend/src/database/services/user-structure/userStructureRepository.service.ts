import { In } from "typeorm";
import {
  UserStructure,
  UserStructureProfile,
  UserStructureRole,
} from "../../../_common/model";
import { UserStructureTable } from "../../entities";
import { pgRepository, typeOrmSearch } from "../_postgres";

export const USERS_USER_PROFILE_ATTRIBUTES: (keyof UserStructureTable)[] = [
  "id",
  "prenom",
  "nom",
  "email",
  "verified",
  "structureId",
  "fonction",
  "role",
];
export const USERS_ADMIN_EMAILS_ATTRIBUTES: (keyof UserStructureTable)[] = [
  "email",
  "nom",
  "prenom",
];
export type AppUserForAdminEmail = Pick<
  UserStructure,
  "email" | "nom" | "prenom"
>;

const baseRepository = pgRepository.get<
  UserStructureTable,
  UserStructureProfile
>(UserStructureTable, {
  defaultSelect: USERS_USER_PROFILE_ATTRIBUTES,
});

export const userStructureRepository = {
  ...baseRepository,
  findVerifiedStructureUsersByRoles,
};

function findVerifiedStructureUsersByRoles({
  structureId,
  roles,
}: Pick<UserStructureTable, "structureId"> & {
  roles: UserStructureRole[];
}): Promise<UserStructureProfile[]> {
  return baseRepository.findMany(
    typeOrmSearch<UserStructureProfile>({
      structureId,
      verified: true,
      role: In(roles),
    })
  );
}
