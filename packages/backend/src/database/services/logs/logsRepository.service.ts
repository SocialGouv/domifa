import { pgRepository } from "..";
import { appTypeormManager } from "../_postgres";
import { Log } from "../../../_common/model";
import { LogTable } from "../../entities/log/LogTable.typeorm";

const baseRepository = pgRepository.get<LogTable, Log>(LogTable);

export const logsRepository = {
  ...baseRepository,
  getLogStructureSmsEnabled,
};

async function getLogStructureSmsEnabled(structureId: number) {
  const query = `SELECT *
                 FROM "log"
                 WHERE "structureId" = '${structureId}'
                 AND "action" = 'ENABLE_SMS_BY_STRUCTURE'
                 ORDER BY "createdAt" ASC
                 LIMIT 1`;
  const res = await appTypeormManager.getRepository(LogTable).query(query);

  if (res.length > 0) {
    return res[0];
  }
  return null;
}
