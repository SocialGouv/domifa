import { Injectable } from "@nestjs/common";
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
  userStructureRepository,
  userSupervisorRepository,
} from "../../../../database";
import { SuspiciousLogAction } from "../../../security-monitoring/types/security-alert.types";
import {
  SuspiciousActivityQueryDto,
  SuspiciousUserProfile,
} from "../../dto/suspicious-activity-query.dto";
import {
  SuspiciousActivityLogDto,
  SuspiciousResolvedUser,
} from "../../dto/suspicious-activity-log.dto";

@Injectable()
export class AdminSecurityService {
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
    const structureIds = new Set<number>();
    const supervisorIds = new Set<number>();
    for (const row of rows) {
      const key = pickTargetKey(row);
      if (!key) {
        continue;
      }
      if (key.userType === "user_structure") {
        structureIds.add(key.userId);
      } else {
        supervisorIds.add(key.userId);
      }
    }
    if (structureIds.size === 0 && supervisorIds.size === 0) {
      return new Map();
    }

    const [structures, supervisors] = await Promise.all([
      structureIds.size === 0
        ? []
        : userStructureRepository.find({
            where: { id: In([...structureIds]) },
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
    ]);

    const resolved = new Map<string, SuspiciousResolvedUser>();
    for (const u of structures) {
      resolved.set(`user_structure:${u.id}`, {
        userType: "user_structure",
        userId: u.id,
        fullName: formatFullName(u.prenom, u.nom),
        email: u.email,
        role: u.role ?? undefined,
        status: u.status ?? undefined,
        structureId: u.structureId ?? undefined,
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
    return resolved;
  }
}

function buildWhere(
  query: SuspiciousActivityQueryDto
): FindOptionsWhere<AppLogSecurityTable> {
  const where: FindOptionsWhere<AppLogSecurityTable> = {};

  // `actions` filter is opt-in: when omitted (or empty), no `action` clause
  // is added so the listing returns every security event. Previously we
  // fell back to SUSPICIOUS_LOG_ACTIONS, which silently filtered the rows.
  if (query.actions && query.actions.length > 0) {
    where.action = In(query.actions);
  }

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
    context: row.context ?? null,
    resolvedUser,
  };
}

function pickTargetKey(
  row: AppLogSecurityTable
): { userType: SuspiciousUserProfile; userId: number } | null {
  // Security rows write the SUBJECT in userStructureId / userSupervisorId
  // depending on userType.
  if (row.userType === "user_structure" && row.userStructureId) {
    return { userType: "user_structure", userId: row.userStructureId };
  }
  if (row.userType === "user_supervisor" && row.userSupervisorId) {
    return { userType: "user_supervisor", userId: row.userSupervisorId };
  }
  return null;
}

function formatFullName(prenom?: string | null, nom?: string | null): string {
  return [prenom, nom].filter(Boolean).join(" ").trim();
}
