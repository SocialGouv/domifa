import { EntityManager } from "typeorm";

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
  getStructureWithSms,
  getStructureIdsWithSms,
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

async function getStructureIdsWithSms(timeZone: string): Promise<number[]> {
  // Liste des structures accessibles
  const structures = await structureRepository.findManyWithQuery({
    where: `(sms->>'enabledByDomifa')::boolean is true and (sms->>'enabledByStructure')::boolean is true AND "timeZone" = :timezone`,
    select: ["id"],
    params: {
      timezone: timeZone,
    },
  });

  return structures.reduce((acc: number[], value: StructureCommon) => {
    acc.push(value.id);
    return acc;
  }, []);
}

async function getStructureWithSms(
  timeZone: string,
  select: (keyof StructureTable)[]
): Promise<Structure[]> {
  // Liste des structures accessibles
  return await structureRepository.findManyWithQuery({
    where: `(sms->>'enabledByDomifa')::boolean is true and (sms->>'enabledByStructure')::boolean is true AND "timeZone" = :timezone`,
    select,
    params: {
      timezone: timeZone,
    },
  });
}
