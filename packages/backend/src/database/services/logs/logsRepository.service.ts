import { appTypeormManager, pgRepository } from "..";
import { AppLog } from "../../../_common/model";
import { AppLogTable } from "../../entities/app-log/AppLogTable.typeorm";

const baseRepository = pgRepository.get<AppLogTable, AppLog>(AppLogTable);

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
  const res = await appTypeormManager.getRepository(AppLogTable).query(query);

  if (res.length > 0) {
    return res[0];
  }
  return null;
}
