import { In } from "typeorm";
import { AppUser, UserProfile, UserRole } from "../../../_common/model";
import { AppUserTable } from "../../entities";
import { pgRepository } from "../_postgres";

export const USERS_USER_PROFILE_ATTRIBUTES: (keyof AppUserTable)[] = [
  "id",
  "prenom",
  "nom",
  "email",
  "verified",
  "structureId",
  "fonction",
  "role",
];
export const USERS_ADMIN_EMAILS_ATTRIBUTES: (keyof AppUserTable)[] = [
  "email",
  "nom",
  "prenom",
];
export type AppUserForAdminEmail = Pick<AppUser, "email" | "nom" | "prenom">;
export type AppUserForAdminEmailWithTempTokens = AppUserForAdminEmail &
  Pick<AppUser, "temporaryTokens">;

const baseRepository = pgRepository.get<AppUserTable, UserProfile>(
  AppUserTable,
  {
    defaultSelect: USERS_USER_PROFILE_ATTRIBUTES,
  }
);

export const usersRepository = {
  ...baseRepository,
  findVerifiedStructureUsersByRoles,
  findOneByTokenAttribute,
};

function findVerifiedStructureUsersByRoles({
  structureId,
  roles,
}: Pick<AppUserTable, "structureId"> & {
  roles: UserRole[];
}): Promise<UserProfile[]> {
  return baseRepository.findMany({
    structureId,
    verified: true,
    role: In(roles),
  });
}

function findOneByTokenAttribute(
  tokenName: "password" | "creation",
  tokenValue: string
): Promise<UserProfile & Pick<AppUserTable, "temporaryTokens">> {
  return baseRepository.findOneWithQuery({
    select: USERS_USER_PROFILE_ATTRIBUTES.concat(["temporaryTokens"]),
    where: `"temporaryTokens"->>:tokenName = :tokenValue`,
    params: {
      tokenName,
      tokenValue,
    },
  });
}
