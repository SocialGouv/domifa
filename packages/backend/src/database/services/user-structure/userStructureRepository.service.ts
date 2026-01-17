import { In } from "typeorm";
import { UserStructureTable } from "../../entities";
import { myDataSource } from "../_postgres";
import { UserStructureRole, UserStructureProfile } from "@domifa/common";
import { UserStructureBrevo } from "../../../modules/mails/types/UserStructureBrevo.type";

export const userStructureRepository = myDataSource
  .getRepository(UserStructureTable)
  .extend({
    getVerifiedUsersByStructureId(
      structureId: number
    ): Promise<UserStructureProfile[]> {
      return userStructureRepository.find({
        where: {
          structureId,
        },
        select: {
          uuid: true,
          id: true,
          role: true,
          fonction: true,
          fonctionDetail: true,
          nom: true,
          prenom: true,
          email: true,
          createdAt: true,
          lastLogin: true,
          verified: true,
        },
        order: {
          nom: "ASC",
        },
      });
    },
    findVerifiedStructureUsersByRoles({
      structureId,
      roles,
    }: Pick<UserStructureTable, "structureId"> & {
      roles: UserStructureRole[];
    }): Promise<UserStructureProfile[]> {
      return this.findBy({
        structureId,
        verified: true,
        role: In(roles),
      });
    },
    async countUsersByRegionId({
      regionId,
    }: {
      regionId: string;
    }): Promise<number> {
      const query = `SELECT count(*) AS "count" FROM "public"."user_structure" LEFT JOIN "structure" ON "user_structure"."structureId" = "structure"."id" WHERE "structure"."region" = $1`;
      const results: Promise<any> = await this.query(query, [regionId]);
      return typeof results[0] === "undefined"
        ? 0
        : results[0] === null || results[0].length === 0
        ? 0
        : parseInt(results[0].count, 10);
    },
    async getUserWithStructureByIdForSync(
      userId: number
    ): Promise<UserStructureBrevo> {
      const results = await this.query(
        `SELECT
      us.prenom,
      us.nom,
      us.id,
      us.role,
      us.email,
      us."createdAt",
      us."structureId",
      us."lastLogin",
      json_build_object(
        'id', s.id,
        'nom', s.nom,
        'statut', s.statut,
        'decision', s.decision,
        'departement', s.departement,
        'region', s.region,
        'lastLogin', s."lastLogin"
      ) as structure
    FROM user_structure us
    LEFT JOIN structure s ON us."structureId" = s.id
    WHERE us.id = $1`,
        [userId]
      );
      return results[0];
    },

    async getAllUsersForSync(): Promise<UserStructureBrevo[]> {
      return this.query(
        `SELECT
      us.prenom,
      us.nom,
      us.id,
      us.role,
      us.email,
      us."createdAt",
      us."lastLogin",
      json_build_object(
        'id', s.id,
        'nom', s.nom,
        'statut', s.statut,
        'decision', s.decision,
        'departement', s.departement,
        'region', s.region,
        'lastLogin', s."lastLogin"
      ) as structure
    FROM user_structure us
    LEFT JOIN structure s ON us."structureId" = s.id`
      );
    },
  });
