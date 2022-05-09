import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

import { appTypeormManager } from "../../database";
import { AppLogTable } from "../../database/entities/app-log/AppLogTable.typeorm";
import { AppLog } from "../../_common/model";

@Injectable()
export class AppLogsService {
  private appLogsRepository: Repository<AppLogTable>;

  public constructor() {
    this.appLogsRepository = appTypeormManager.getRepository(AppLogTable);
  }

  public async create(appLog: AppLog): Promise<AppLog> {
    const newLog = new AppLogTable(appLog);
    return await this.appLogsRepository.save(newLog);
  }
}
