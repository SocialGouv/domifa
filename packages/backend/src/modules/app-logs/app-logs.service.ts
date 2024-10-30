import { Injectable } from "@nestjs/common";
import { appLogsRepository } from "../../database";

import { AppLogTable } from "../../database/entities/app-log/AppLogTable.typeorm";
import { AppLog } from "../../_common/model";

@Injectable()
export class AppLogsService {
  public async create(appLog: AppLog): Promise<AppLog> {
    return await appLogsRepository.save(new AppLogTable(appLog));
  }
}
