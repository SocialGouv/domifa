import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

import { appTypeormManager } from "../database";
import { LogTable } from "../database/entities/log/LogTable.typeorm";
import { Log } from "../_common/model";

@Injectable()
export class LogsService {
  private logsRepository: Repository<LogTable>;

  public constructor() {
    this.logsRepository = appTypeormManager.getRepository(LogTable);
  }

  public async create(log: Log): Promise<Log> {
    const newLog = new LogTable(log);

    return await this.logsRepository.save(newLog);
  }
}
