import { In } from "typeorm";
import { UserStructureTable } from "../../entities";
import { myDataSource } from "../_postgres";
import { UserStructureRole, UserStructureProfile } from "@domifa/common";

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
  });
