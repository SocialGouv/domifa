import {
  CurrentUserSession,
  HistoricalUserSession,
} from "../../../_common/model";
import { AppLogActorType } from "../../app-logs/types";
import { SuspiciousLogAction } from "../../security-monitoring/types/security-alert.types";
import { SuspiciousUserProfile } from "./suspicious-activity-query.dto";

export type ResolvedUserType = SuspiciousUserProfile | "usager";

export interface SuspiciousResolvedUser {
  userType: ResolvedUserType;
  userId: number;
  fullName: string;
  email?: string;
  role?: string;
  status?: string;
  structureId?: number;
  structureName?: string;
  uuid?: string;
}

export interface SuspiciousActivityLogDto {
  uuid: string;
  action: SuspiciousLogAction;
  createdAt: Date;
  userType?: AppLogActorType;
  ip?: string | null;
  userAgent?: string | null;
  context: Record<string, unknown> | null;
  resolvedUser?: SuspiciousResolvedUser;
}

export interface UserSessionsViewDto {
  userId: number;
  currentSession: CurrentUserSession | null;
  sessionsHistory: HistoricalUserSession[];
  fingerprintHash: string | null;
}
