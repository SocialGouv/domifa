import { In } from "typeorm";
import {
  UserStructure,
  UserStructureProfile,
  UserStructureRole,
} from "../../../_common/model";
import { UserStructureTable } from "../../entities";
import { appTypeormManager, pgRepository, typeOrmSearch } from "../_postgres";

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
  typeorm: appTypeormManager.getRepository(UserStructureTable),
  findVerifiedStructureUsersByRoles,
  countUsersByRegionId,
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

async function countUsersByRegionId({
  regionId,
}: {
  regionId: string;
}): Promise<number> {
  const query = `SELECT count(*) AS "count" FROM "public"."user_structure" LEFT JOIN "structure" ON "user_structure"."structureId" = "structure"."id" WHERE "structure"."region" = '${regionId}'`;

  const results = await appTypeormManager
    .getRepository(UserStructureTable)
    .query(query);

  return typeof results[0] === "undefined"
    ? 0
    : results[0] === null || results[0].length === 0
    ? 0
    : parseInt(results[0].count, 10);
}
