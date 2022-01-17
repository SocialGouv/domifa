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
  getStructureWithSmsEnabled,
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

async function getStructureWithSmsEnabled() {
  const query = `SELECT id
                 FROM "structure"
                 WHERE sms->>'enabledByDomifa' = 'true'
                 AND sms->>'enabledByStructure' = 'true'
                 ORDER BY "createdAt" ASC`;

  return appTypeormManager.getRepository(StructureTable).query(query);
}
