import { Injectable } from "@nestjs/common";
import { appLogsRepository } from "../../database";

import { AppLogTable } from "../../database/entities/app-log/AppLogTable.typeorm";
import { AppLog } from "../../_common/model";

@Injectable()
export class AppLogsService {
  public async create<T = any>(appLog: AppLog<T>): Promise<AppLog<T>> {
    return await appLogsRepository.save(new AppLogTable(appLog));
  }
}
