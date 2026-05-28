import { Injectable, NotFoundException } from "@nestjs/common";
import {
  And,
  Between,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
} from "typeorm";

import { PageMeta, PageOptions, PageResults } from "@domifa/common";

import {
  appLogSecurityRepository,
  AppLogSecurityTable,
  structureRepository,
  usagerRepository,
  userStructureRepository,
  userStructureSecurityRepository,
  userSupervisorRepository,
  userSupervisorSecurityRepository,
  userUsagerRepository,
} from "../../../../database";
import { SUSPICIOUS_LOG_ACTIONS } from "../../../security-monitoring/constants/SECURITY_LOG_ACTIONS.const";
import { SuspiciousLogAction } from "../../../security-monitoring/types/security-alert.types";
import {
  SuspiciousActivityQueryDto,
  SuspiciousUserProfile,
} from "../../dto/suspicious-activity-query.dto";
import {
  ResolvedUserType,
  SuspiciousActivityLogDto,
  SuspiciousResolvedUser,
  UserSessionsViewDto,
} from "../../dto/suspicious-activity-log.dto";

@Injectable()
export class AdminSecurityService {
  public async getUserSessions(
    userType: SuspiciousUserProfile,
    uuid: string
  ): Promise<UserSessionsViewDto> {
    const userId = await resolveUserIdByUuid(userType, uuid);

    const repo =
      userType === "user_supervisor"
        ? userSupervisorSecurityRepository
        : userStructureSecurityRepository;

    const row = await repo.findOne({
      where: { userId },
      select: {
        userId: true,
        currentSession: true,
        sessionsHistory: true,
        fingerprintHash: true,
      },
    });
    return {
      userId,
      currentSession: row?.currentSession ?? null,
      sessionsHistory: row?.sessionsHistory ?? [],
      fingerprintHash: row?.fingerprintHash ?? null,
    };
  }

  public async findSuspiciousActivity(
    query: SuspiciousActivityQueryDto
  ): Promise<PageResults<SuspiciousActivityLogDto>> {
    const [rows, itemCount] = await appLogSecurityRepository.findAndCount({
      where: buildWhere(query),
      order: { createdAt: "DESC" },
      skip: query.skip,
      take: query.take,
    });

    const resolvedUsers = await this.resolveUsers(rows);
    const data = rows.map((row) => toDto(row, resolvedUsers));

    return new PageResults<SuspiciousActivityLogDto>({
      data,
      meta: new PageMeta({
        itemCount,
        pageOptions: new PageOptions({ page: query.page, take: query.take }),
      }),
    });
  }

  private async resolveUsers(
    rows: AppLogSecurityTable[]
  ): Promise<Map<string, SuspiciousResolvedUser>> {
    const structureUserIds = new Set<number>();
    const supervisorIds = new Set<number>();
    const usagerUserIds = new Set<number>();
    for (const row of rows) {
      const key = pickTargetKey(row);
      if (!key) {
        continue;
      }
      if (key.userType === "user_structure") {
        structureUserIds.add(key.userId);
      } else if (key.userType === "user_supervisor") {
        supervisorIds.add(key.userId);
      } else if (key.userType === "usager") {
        usagerUserIds.add(key.userId);
      }
    }
    if (
      structureUserIds.size === 0 &&
      supervisorIds.size === 0 &&
      usagerUserIds.size === 0
    ) {
      return new Map();
    }

    const [structureUsers, supervisors, usagerUsers] = await Promise.all([
      structureUserIds.size === 0
        ? []
        : userStructureRepository.find({
            where: { id: In([...structureUserIds]) },
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              role: true,
              status: true,
              structureId: true,
              uuid: true,
            },
          }),
      supervisorIds.size === 0
        ? []
        : userSupervisorRepository.find({
            where: { id: In([...supervisorIds]) },
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              role: true,
              status: true,
              uuid: true,
            },
          }),
      usagerUserIds.size === 0
        ? []
        : userUsagerRepository.find({
            where: { id: In([...usagerUserIds]) },
            select: {
              id: true,
              login: true,
              status: true,
              structureId: true,
              usagerUUID: true,
            },
          }),
    ]);

    // Batch the structure names + usager identities so the per-row build
    // below stays O(1). Usager → usager table holds nom/prenom keyed by uuid.
    const usagerUuids = usagerUsers
      .map((u) => u.usagerUUID)
      .filter((v): v is string => !!v);
    const structureIdsToLoad = new Set<number>();
    for (const u of structureUsers) {
      if (u.structureId) {
        structureIdsToLoad.add(u.structureId);
      }
    }
    for (const u of usagerUsers) {
      if (u.structureId) {
        structureIdsToLoad.add(u.structureId);
      }
    }

    const [usagerIdentities, structures] = await Promise.all([
      usagerUuids.length === 0
        ? []
        : usagerRepository.find({
            where: { uuid: In(usagerUuids) },
            select: { uuid: true, nom: true, prenom: true },
          }),
      structureIdsToLoad.size === 0
        ? []
        : structureRepository.find({
            where: { id: In([...structureIdsToLoad]) },
            select: { id: true, nom: true, ville: true },
          }),
    ]);

    // UsagerTable.uuid is typed as optional (AppTypeormTable), but rows here
    // were fetched via `where: { uuid: In(usagerUuids) }` so every match is
    // guaranteed to have one. Filter to narrow the type without a cast.
    const usagerIdentityByUuid = new Map(
      usagerIdentities
        .filter(
          (u): u is typeof u & { uuid: string } =>
            typeof u.uuid === "string" && u.uuid.length > 0
        )
        .map((u) => [u.uuid, u] as const)
    );
    const structureById = new Map(structures.map((s) => [s.id, s] as const));

    const resolved = new Map<string, SuspiciousResolvedUser>();
    for (const u of structureUsers) {
      resolved.set(`user_structure:${u.id}`, {
        userType: "user_structure",
        userId: u.id,
        fullName: formatFullName(u.prenom, u.nom),
        email: u.email,
        role: u.role ?? undefined,
        status: u.status ?? undefined,
        structureId: u.structureId ?? undefined,
        structureName: formatStructureName(
          u.structureId ? structureById.get(u.structureId) : undefined
        ),
        uuid: u.uuid ?? undefined,
      });
    }
    for (const u of supervisors) {
      resolved.set(`user_supervisor:${u.id}`, {
        userType: "user_supervisor",
        userId: u.id,
        fullName: formatFullName(u.prenom, u.nom),
        email: u.email,
        role: u.role ?? undefined,
        status: u.status ?? undefined,
        uuid: u.uuid ?? undefined,
      });
    }
    for (const u of usagerUsers) {
      const identity = u.usagerUUID
        ? usagerIdentityByUuid.get(u.usagerUUID)
        : undefined;
      resolved.set(`usager:${u.id}`, {
        userType: "usager",
        userId: u.id,
        fullName: formatFullName(identity?.prenom, identity?.nom) || u.login,
        email: u.login,
        status: u.status ?? undefined,
        structureId: u.structureId ?? undefined,
        structureName: formatStructureName(
          u.structureId ? structureById.get(u.structureId) : undefined
        ),
        uuid: u.usagerUUID ?? undefined,
      });
    }
    return resolved;
  }
}

function buildWhere(
  query: SuspiciousActivityQueryDto
): FindOptionsWhere<AppLogSecurityTable> {
  const where: FindOptionsWhere<AppLogSecurityTable> = {};

  // "Activité suspecte" only shows the genuinely suspicious actions
  // (BLOCK_USER, REQUEST_BLOCKED, THROTTLE_BLOCKED, …). When the caller
  // narrows it further via `actions`, intersect to keep both invariants:
  // the user filter is honored AND no LOGIN_SUCCESS / OTP_REQUESTED noise
  // leaks in.
  const baseActions: SuspiciousLogAction[] = SUSPICIOUS_LOG_ACTIONS;
  const requestedActions = query.actions ?? [];
  const allowed =
    requestedActions.length > 0
      ? requestedActions.filter((a) => baseActions.includes(a))
      : baseActions;
  where.action = In(allowed);

  if (query.userType) {
    where.userType = query.userType;
  }
  if (query.userId) {
    if (query.userType === "user_supervisor") {
      where.userSupervisorId = query.userId;
    } else if (query.userType === "user_structure") {
      where.userStructureId = query.userId;
    }
  }

  const dateRange = buildDateRange(query.dateFrom, query.dateTo);
  if (dateRange) {
    where.createdAt = dateRange;
  }

  // `context` is typed `json` in the entity. Cast to ::jsonb so the ->> /
  // ILIKE operators are available; And() lets ip + identifier coexist.
  const contextFilters = [
    query.ip
      ? Raw((alias) => `(${alias}::jsonb)->>'ip' = :ip`, { ip: query.ip })
      : null,
    query.identifier
      ? Raw(
          (alias) =>
            `(${alias}::jsonb)->>'attemptedIdentifier' ILIKE :identifier`,
          { identifier: `%${query.identifier}%` }
        )
      : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  if (contextFilters.length === 1) {
    where.context = contextFilters[0];
  } else if (contextFilters.length > 1) {
    where.context = And(...contextFilters);
  }

  return where;
}

function buildDateRange(from?: Date, to?: Date) {
  if (from && to) {
    return Between(from, to);
  }
  if (from) {
    return MoreThanOrEqual(from);
  }
  if (to) {
    return LessThanOrEqual(to);
  }
  return null;
}

function toDto(
  row: AppLogSecurityTable,
  resolved: Map<string, SuspiciousResolvedUser>
): SuspiciousActivityLogDto {
  const key = pickTargetKey(row);
  const resolvedUser = key
    ? resolved.get(`${key.userType}:${key.userId}`)
    : undefined;
  return {
    uuid: row.uuid ?? "",
    action: row.action as SuspiciousLogAction,
    createdAt: row.createdAt!,
    userType: row.userType,
    ip: row.ip ?? null,
    userAgent: row.userAgent ?? null,
    context: row.context ?? null,
    resolvedUser,
  };
}

function pickTargetKey(
  row: AppLogSecurityTable
): { userType: ResolvedUserType; userId: number } | null {
  // Security rows write the SUBJECT in userStructureId / userSupervisorId /
  // userUsagerId depending on userType. We accept the legacy mismatch where
  // `userType` was not yet set on older rows: fall back to whichever FK
  // column carries a value so the admin UI can still attribute the event.
  if (row.userType === "user_structure" && row.userStructureId) {
    return { userType: "user_structure", userId: row.userStructureId };
  }
  if (row.userType === "user_supervisor" && row.userSupervisorId) {
    return { userType: "user_supervisor", userId: row.userSupervisorId };
  }
  if (row.userType === "usager" && row.userUsagerId) {
    return { userType: "usager", userId: row.userUsagerId };
  }
  if (row.userStructureId) {
    return { userType: "user_structure", userId: row.userStructureId };
  }
  if (row.userSupervisorId) {
    return { userType: "user_supervisor", userId: row.userSupervisorId };
  }
  if (row.userUsagerId) {
    return { userType: "usager", userId: row.userUsagerId };
  }
  return null;
}

function formatFullName(prenom?: string | null, nom?: string | null): string {
  return [prenom, nom].filter(Boolean).join(" ").trim();
}

function formatStructureName(
  structure: { nom?: string | null; ville?: string | null } | undefined
): string | undefined {
  if (!structure) {
    return undefined;
  }
  const parts = [structure.nom, structure.ville].filter(
    (s): s is string => !!s && s.length > 0
  );
  return parts.length > 0 ? parts.join(" — ") : undefined;
}

async function resolveUserIdByUuid(
  userType: SuspiciousUserProfile,
  uuid: string
): Promise<number> {
  const repo =
    userType === "user_supervisor"
      ? userSupervisorRepository
      : userStructureRepository;
  const user = await repo.findOne({ where: { uuid }, select: { id: true } });
  if (!user) {
    throw new NotFoundException("USER_NOT_FOUND");
  }
  return user.id;
}
