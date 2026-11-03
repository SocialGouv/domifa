import { FindOptionsSelect, In, Not } from "typeorm";
import { UserStructureTable } from "../../entities";
import { myDataSource } from "../_postgres";
import { UserStructureRole, UserStructureProfile } from "@domifa/common";
import { UserStructureBrevo } from "../../../modules/mails/types/UserStructureBrevo.type";
import { userStructureSecurityRepository } from "../user-structure-security";

const PUBLIC_FIELDS_FOR_USER_STRUCTURE: FindOptionsSelect<UserStructureTable> =
  {
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
    status: true,
  };

export const userStructureRepository = myDataSource
  .getRepository(UserStructureTable)
  .extend({
    getActiveUsersByStructureId(
      structureId: number
    ): Promise<UserStructureProfile[]> {
      return userStructureRepository.find({
        where: {
          structureId,
          status: "ACTIVE",
        },
        select: {
          ...PUBLIC_FIELDS_FOR_USER_STRUCTURE,
        },
        order: {
          nom: "ASC",
        },
      });
    },
    getUsersByStructureId(
      structureId: number
    ): Promise<UserStructureProfile[]> {
      return userStructureRepository.find({
        where: {
          structureId,
          status: Not("DELETE"),
        },
        select: {
          ...PUBLIC_FIELDS_FOR_USER_STRUCTURE,
        },
        order: {
          nom: "ASC",
        },
      });
    },
    findStructureUsersByRoles({
      structureId,
      roles,
    }: Pick<UserStructureTable, "structureId"> & {
      roles: UserStructureRole[];
    }): Promise<UserStructureProfile[]> {
      return this.findBy({
        structureId,
        status: "ACTIVE",
        role: In(roles),
      });
    },
    async countUsersByRegionId({
      regionId,
    }: {
      regionId: string;
    }): Promise<number> {
      const query = `SELECT count(*) AS "count" FROM "public"."user_structure" LEFT JOIN "structure" ON "user_structure"."structureId" = "structure"."id" WHERE "structure"."region" = $1 AND "user_structure"."status" <> 'DELETE'`;
      const results: Promise<any> = await this.query(query, [regionId]);
      return typeof results[0] === "undefined"
        ? 0
        : results[0] === null || results[0].length === 0
        ? 0
        : parseInt(results[0].count, 10);
    },
    // Deletes the security row + the user row in the right order so the FK
    // doesn't complain. Restricted to the structure scope so the controller
    // can't accidentally delete a user from another structure.
    async deleteWithSecurity({
      userId,
      structureId,
    }: {
      userId: number;
      structureId: number;
    }): Promise<void> {
      await userStructureSecurityRepository.delete({ userId });
      await userStructureRepository.delete({ id: userId, structureId });
    },
    async deleteWithSecurityByEmail(email: string): Promise<void> {
      const user = await userStructureRepository.findOneBy({ email });
      if (user) {
        await userStructureRepository.deleteWithSecurity({
          userId: user.id,
          structureId: user.structureId,
        });
      }
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
      us.status,
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
    WHERE us.id = $1
      AND us.status <> 'DELETE'`,
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
      us.status,
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
    LEFT JOIN structure s ON us."structureId" = s.id
    WHERE us.status <> 'DELETE'`
      );
    },

    // Users of validated structures with no login since `inactiveSince`.
    // Reference date = last login, or account creation if never connected.
    // Structures where nobody is active anymore are left out: the inactive
    // structures cron deletes them with all their users. The EXISTS clause is
    // the exact complement of its rule (any user, any status, plus the
    // structure registration date).
    async findInactiveUsers(inactiveSince: Date): Promise<InactiveUser[]> {
      return this.query(
        `
        SELECT
          us.id,
          us."structureId",
          us.email,
          us.prenom,
          us.nom,
          us.role,
          us."lastLogin",
          COALESCE(us."lastLogin", us."createdAt") AS "referenceDate",
          s.nom AS "structureNom"
        FROM user_structure us
        INNER JOIN structure s ON s.id = us."structureId"
        WHERE us.status <> 'DELETE'
          AND s.statut = 'VALIDE'
          AND COALESCE(us."lastLogin", us."createdAt") <= $1
          AND (
            s."registrationDate" > $1
            OR EXISTS (
              SELECT 1 FROM user_structure other
              WHERE other."structureId" = us."structureId"
                AND GREATEST(other."lastLogin", other."createdAt") > $1
            )
          )
        ORDER BY us."structureId" ASC, "referenceDate" ASC
        `,
        [inactiveSince]
      );
    },
  });

export type InactiveUser = Pick<
  UserStructureTable,
  "id" | "structureId" | "email" | "prenom" | "nom" | "role" | "lastLogin"
> & {
  referenceDate: Date;
  structureNom: string;
};
