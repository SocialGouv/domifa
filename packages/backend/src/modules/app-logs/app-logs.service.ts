import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

import { appTypeormManager } from "../../database";
import { AppLogTable } from "../../database/entities/app-log/AppLogTable.typeorm";
import { AppLog } from "../../_common/model";

@Injectable()
export class AppLogsService {
  private logsRepository: Repository<AppLogTable>;

  public constructor() {
    this.logsRepository = appTypeormManager.getRepository(AppLogTable);
  }

  public async create(appLog: AppLog): Promise<AppLog> {
    const newLog = new AppLogTable(appLog);
    return await this.logsRepository.save(newLog);
  }
}
