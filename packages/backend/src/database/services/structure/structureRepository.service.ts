import { Structure } from "@domifa/common";

import { StructureTable } from "../../entities";
import { joinSelectFields, myDataSource, pgRepository } from "../_postgres";
import { StructureAdminForList } from "../../../modules/portail-admin";

const baseRepository = pgRepository.get<StructureTable, Structure>(
  StructureTable
);

export const structureRepository = myDataSource
  .getRepository<Structure>(StructureTable)
  .extend({
    countBy: baseRepository.countBy,

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
    ): Promise<StructureAdminForList[]> {
      const qb = this.createQueryBuilder("structure")
        .select([
          `"structure"."id"`,
          `"structure"."registrationDate"`,
          `"structure"."adresse"`,
          `"structure"."complementAdresse"`,
          `"structure"."nom"`,
          `"structure"."structureType"`,
          `"structure"."ville"`,
          `"structure"."departement"`,
          `"structure"."region"`,
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
  });
