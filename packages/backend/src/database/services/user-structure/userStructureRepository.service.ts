import { myDataSource } from "..";
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

// Nouveau modèle de repository, les fonctions seront migrés une par une au fur & à mesure
export const newUserStructureRepository = myDataSource
  .getRepository(UserStructureTable)
  .extend({
    findVerifiedStructureUsersByRoles,
    countUsersByRegionId,
  });

export const userStructureRepository = {
  ...baseRepository,
};

async function findVerifiedStructureUsersByRoles({
  structureId,
  roles,
}: Pick<UserStructureTable, "structureId"> & {
  roles: UserStructureRole[];
}): Promise<UserStructureProfile[]> {
  return await myDataSource.getRepository(UserStructureTable).findBy(
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

  const results = await myDataSource
    .getRepository(UserStructureTable)
    .query(query);

  return typeof results[0] === "undefined"
    ? 0
    : results[0] === null || results[0].length === 0
    ? 0
    : parseInt(results[0].count, 10);
}
