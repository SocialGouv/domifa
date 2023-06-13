import { TimeZone } from "./../../../util/territoires/types/TimeZone.type";

import {
  Structure,
  StructureCommon,
  STRUCTURE_COMMON_ATTRIBUTES,
} from "../../../_common/model";
import { StructureTable } from "../../entities";
import { appTypeormManager, pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureTable, Structure>(
  StructureTable
);

export const structureRepository = appTypeormManager
  .getRepository<Structure>(StructureTable)
  .extend({
    countBy: baseRepository.countBy,
    findOneWithQuery: baseRepository.findOneWithQuery,
    findManyWithQuery: baseRepository.findManyWithQuery,
    checkHardResetToken,
    getStructureWithSms,
    getStructureIdsWithSms,
  });

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

async function getStructureIdsWithSms(timeZone: TimeZone): Promise<number[]> {
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
  timeZone: TimeZone,
  select: (keyof StructureTable)[]
): Promise<Structure[]> {
  return await structureRepository.findManyWithQuery({
    where: `(sms->>'enabledByDomifa')::boolean is true and (sms->>'enabledByStructure')::boolean is true AND "timeZone" = :timezone`,
    select,
    params: {
      timezone: timeZone,
    },
  });
}
