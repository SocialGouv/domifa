import { EntityManager } from "typeorm";

import { appTypeormManager } from "../_postgres";
import {
  Structure,
  StructureCommon,
  STRUCTURE_COMMON_ATTRIBUTES,
} from "../../../_common/model";
import { StructureTable } from "../../entities";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureTable, Structure>(
  StructureTable
);

export const structureRepository = {
  ...baseRepository,
  getForMigration: (entityManager: EntityManager) =>
    pgRepository.get<StructureTable, Structure>(StructureTable, {
      entityManager,
    }),
  checkHardResetToken,
  statsStructureSmsWithoutDateActivation,
  statsStructureSmsWithDateActivation,
};

async function checkHardResetToken({
  userId,
  token,
}: {
  userId: number;
  token: string;
}): Promise<StructureCommon & Pick<Structure, "hardReset">> {
  const select: (keyof StructureCommon & Pick<Structure, "hardReset">)[] = (
    STRUCTURE_COMMON_ATTRIBUTES as any[]
  ).concat(["hardReset"]);

  return structureRepository.findOneWithQuery<
    StructureCommon & Pick<Structure, "hardReset">
  >({
    select,
    where: `"hardReset" @> '{"token": "${token}", "userId": ${userId}}'`,
    params: [],
  });
}

async function statsStructureSmsWithoutDateActivation() {
  const query = `SELECT count(*) as "count"
                 FROM structure
                 WHERE NOT sms ? 'dateActivation'
                 AND sms->>'enabledByDomifa' = 'true'
                 AND sms->>'enabledByStructure' = 'true'`;

  return appTypeormManager.getRepository(StructureTable).query(query);
}

async function statsStructureSmsWithDateActivation() {
  const query = `SELECT date_trunc('month', CAST(sms->>'dateActivation' AS timestamp)) AS "dateActivation", count(*) AS "count"
                 FROM "structure"
                 WHERE sms->>'enabledByDomifa' = 'true'
                 AND sms->>'dateActivation' != 'null'
                 AND CAST(sms->>'dateActivation' AS timestamp) >= date_trunc('month', CAST((CAST(now() AS timestamp) + (INTERVAL '-12 month')) AS timestamp))
                GROUP BY date_trunc('month', CAST(sms->>'dateActivation' AS timestamp))
                ORDER BY date_trunc('month', CAST(sms->>'dateActivation' AS timestamp)) ASC`;

  return appTypeormManager.getRepository(StructureTable).query(query);
}
