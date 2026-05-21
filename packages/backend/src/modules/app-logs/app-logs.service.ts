import { Injectable } from "@nestjs/common";
import { PageMeta, PageOptions, PageResults } from "@domifa/common";

import { appLogsRepository } from "../../database";
import { AppLogTable } from "../../database/entities/app-log/AppLogTable.typeorm";
import { AppLog, AppLogActorType } from "./types";

export interface FindUserLogsOptions {
  userType: AppLogActorType;
  userId: number;
  page: number;
  take: number;
}

export interface FindStructureLogsOptions {
  structureId: number;
  page: number;
  take: number;
}

@Injectable()
export class AppLogsService {
  public async create<T = any>(appLog: AppLog<T>): Promise<AppLog<T>> {
    return await appLogsRepository.save(new AppLogTable(appLog));
  }

  public async findUserLogs(
    options: FindUserLogsOptions
  ): Promise<PageResults<AppLogTable>> {
    const { userType, userId, page, take } = options;

    const [data, itemCount] = await appLogsRepository.findAndCount({
      where: { userId, userType },
      order: { createdAt: "DESC" },
      skip: (page - 1) * take,
      take,
    });

    return new PageResults<AppLogTable>({
      data,
      meta: new PageMeta({
        itemCount,
        pageOptions: new PageOptions({ page, take }),
      }),
    });
  }

  public async findStructureLogs(
    options: FindStructureLogsOptions
  ): Promise<PageResults<AppLogTable>> {
    const { structureId, page, take } = options;

    const [data, itemCount] = await appLogsRepository.findAndCount({
      where: { structureId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * take,
      take,
    });

    return new PageResults<AppLogTable>({
      data,
      meta: new PageMeta({
        itemCount,
        pageOptions: new PageOptions({ page, take }),
      }),
    });
  }
}
