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

@Injectable()
export class AppLogsService {
  public async create<T = any>(appLog: AppLog<T>): Promise<AppLog<T>> {
    return await appLogsRepository.save(new AppLogTable(appLog));
  }

  public async findUserLogs(
    options: FindUserLogsOptions
  ): Promise<PageResults<AppLogTable>> {
    const { userType, userId, page, take } = options;
    // A user's "activité" shows two kinds of logs:
    // 1. Actions they performed (actor): filter by userSupervisorId /
    //    userStructureId — these are filled by build*ActorFields at write time.
    // 2. Actions performed ON them (target): the actor's id is the admin,
    //    but the target's id sits in context (e.g. BLOCK_USER_BY_ADMIN stores
    //    { userId, userProfile, ... } or { blockedUser: { userId, userProfile } }
    //    for automatic blocks). We match both shapes and filter by userProfile
    //    so a supervisor with id=5 doesn't pick up structure-user-5's logs.
    const isSupervisor = userType === "user_supervisor";
    const idColumn = isSupervisor ? "userSupervisorId" : "userStructureId";
    const profileKey = isSupervisor ? "supervisor" : "structure";
    const userIdStr = String(userId);

    const qb = appLogsRepository
      .createQueryBuilder("log")
      .where(
        `(log."${idColumn}" = :userId AND log."userType" = :userType)` +
          ` OR (log.context->>'userId' = :userIdStr AND log.context->>'userProfile' = :profileKey)` +
          ` OR (log.context->'blockedUser'->>'userId' = :userIdStr AND log.context->'blockedUser'->>'userProfile' = :profileKey)`,
        { userId, userType, userIdStr, profileKey }
      )
      .orderBy('log."createdAt"', "DESC")
      .skip((page - 1) * take)
      .take(take);

    const [data, itemCount] = await qb.getManyAndCount();

    return new PageResults<AppLogTable>({
      data,
      meta: new PageMeta({
        itemCount,
        pageOptions: new PageOptions({ page, take }),
      }),
    });
  }
}
