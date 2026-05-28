import { Injectable } from "@nestjs/common";
import { PageMeta, PageOptions, PageResults } from "@domifa/common";

import { appLogSecurityRepository } from "../../database";
import { AppLogSecurityTable } from "../../database/entities/app-log-security/AppLogSecurityTable.typeorm";
import { AppLogSecurity } from "./types";
import { FindUserLogsOptions } from "./app-logs.service";

@Injectable()
export class AppLogSecurityService {
  public async create<T = any>(
    log: AppLogSecurity<T>
  ): Promise<AppLogSecurity<T>> {
    return appLogSecurityRepository.save(new AppLogSecurityTable(log));
  }

  public async findUserSecurityLogs(
    options: FindUserLogsOptions
  ): Promise<PageResults<AppLogSecurityTable>> {
    const { userType, userId, page, take } = options;

    // app_log_security splits the subject across two FK columns (one per
    // profile) instead of a single `userId`, so route on userType.
    const where =
      userType === "user_supervisor"
        ? { userType, userSupervisorId: userId }
        : { userType, userStructureId: userId };

    const [data, itemCount] = await appLogSecurityRepository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (page - 1) * take,
      take,
    });

    return new PageResults<AppLogSecurityTable>({
      data,
      meta: new PageMeta({
        itemCount,
        pageOptions: new PageOptions({ page, take }),
      }),
    });
  }

  public async findStructureSecurityLogs(options: {
    structureId: number;
    page: number;
    take: number;
    userType?: "user_structure" | "usager";
  }): Promise<PageResults<AppLogSecurityTable>> {
    const { structureId, page, take, userType } = options;

    const where: Record<string, unknown> = { structureId };
    if (userType) {
      where.userType = userType;
    }

    const [data, itemCount] = await appLogSecurityRepository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (page - 1) * take,
      take,
    });

    return new PageResults<AppLogSecurityTable>({
      data,
      meta: new PageMeta({
        itemCount,
        pageOptions: new PageOptions({ page, take }),
      }),
    });
  }
}
