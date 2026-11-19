import { Structure, StructureAdmin } from "@domifa/common";

import { StructureTable } from "../../entities";
import { joinSelectFields, myDataSource } from "../_postgres";

const inactiveStructuresSubquery = (activeUsagers: "EXISTS" | "NOT EXISTS") => `
  SELECT
    s.id,
    s.uuid,
    s.nom,
    s.email,
    s."registrationDate",
    MAX(us."lastLogin") AS "lastLogin",
    GREATEST(
      MAX(us."lastLogin"),
      MAX(us."createdAt"),
      s."registrationDate"
    ) AS "referenceDate",
    (
      SELECT COUNT(*)::int FROM usager u
      WHERE u."structureId" = s.id AND u.statut = 'VALIDE'
    ) AS "nbUsagersActifs"
  FROM structure s
  LEFT JOIN user_structure us ON us."structureId" = s.id
  WHERE s.statut = 'VALIDE'
    AND ${activeUsagers} (
      SELECT 1 FROM usager u
      WHERE u."structureId" = s.id AND u.statut = 'VALIDE'
    )
  GROUP BY s.id, s.uuid, s.nom, s.email, s."registrationDate"
`;

export const structureRepository = myDataSource
  .getRepository<Structure>(StructureTable)
  .extend({
    async checkHardResetToken({
      userId,
      token,
    }: {
      userId: number;
      token: string;
    }): Promise<Pick<Structure, "hardReset" | "id" | "uuid">> {
      const select = ["hardReset", "id", "uuid"];

      return await this.createQueryBuilder()
        .select(joinSelectFields(select))
        .where(`"hardReset" @> :hardReset`, {
          hardReset: JSON.stringify({ token, userId }),
        })
        .getRawOne();
    },

    async getAdminStructuresListData(
      structureId?: number
    ): Promise<StructureAdmin[]> {
      const qb = this.createQueryBuilder("structure")
        .select([
          `"structure"."id"`,
          `"structure"."uuid"`,
          `"structure"."registrationDate"`,
          `"structure"."adresse"`,
          `"structure"."complementAdresse"`,
          `"structure"."nom"`,
          `"structure"."structureType"`,
          `"structure"."ville"`,
          `"structure"."departement"`,
          `"structure"."departmentName"`,
          `"structure"."region"`,
          `"structure"."regionName"`,
          `"structure"."capacite"`,
          `"structure"."codePostal"`,
          `"structure"."agrement"`,
          `"structure"."email"`,
          `"structure"."responsable"`,
          `"structure"."options"`,
          `"structure"."adresseCourrier"`,
          `"structure"."sms"`,
          `"structure"."portailUsager"`,
          `"structure"."statut"`,
          `"structure"."decision"`,
          `"structure"."import"`,
          `"structure"."timeZone"`,
          `"structure"."importDate"`,
          `"structure"."lastLogin"`,
          `(SELECT COUNT(DISTINCT u.uuid) FROM usager u WHERE u."structureId" = "structure"."id") AS "usagers"`,
          `(SELECT COUNT(DISTINCT us.uuid) FROM user_structure us WHERE us."structureId" = "structure"."id") AS "users"`,
          `(SELECT COUNT(DISTINCT u.uuid) FROM usager u WHERE u."structureId" = "structure"."id" AND u.statut = 'VALIDE') AS "actifs"`,
        ])
        .orderBy(`"structure"."createdAt"`, "DESC");

      if (structureId) {
        qb.where(`"structure"."id" = :structureId`, { structureId });
      }

      return qb.getRawMany();
    },

    // Validated structures where no user has logged in since `inactiveSince`.
    // Reference date = most recent of: users' last login, users' account
    // creation (never-connected users), structure registration.
    // Structures with at least one active (VALIDE) usager are never returned.
    async findInactiveStructures(
      inactiveSince: Date
    ): Promise<InactiveStructure[]> {
      return this.query(
        `
        SELECT * FROM (${inactiveStructuresSubquery("NOT EXISTS")}) inactive
        WHERE inactive."referenceDate" <= $1
        ORDER BY inactive."referenceDate" ASC
        `,
        [inactiveSince]
      );
    },

    // Same inactivity rule, but structures kept because they still have
    // active usagers. Each one is returned once per inactivity period: a
    // STRUCTURE_INACTIVE_KEPT_NOTIFIED log newer than the reference date
    // means its admins were already notified.
    async findInactiveStructuresKept(
      inactiveSince: Date
    ): Promise<InactiveStructureKept[]> {
      return this.query(
        `
        SELECT * FROM (${inactiveStructuresSubquery("EXISTS")}) inactive
        WHERE inactive."referenceDate" <= $1
          AND NOT EXISTS (
            SELECT 1 FROM app_log l
            WHERE l."structureId" = inactive.id
              AND l.action = 'STRUCTURE_INACTIVE_KEPT_NOTIFIED'
              AND l."createdAt" >= inactive."referenceDate"
          )
        ORDER BY inactive."referenceDate" ASC
        `,
        [inactiveSince]
      );
    },
  });

export type InactiveStructure = Pick<
  Structure,
  "id" | "uuid" | "nom" | "email" | "registrationDate"
> & {
  lastLogin: Date | null;
  referenceDate: Date;
};

export type InactiveStructureKept = InactiveStructure & {
  nbUsagersActifs: number;
};
