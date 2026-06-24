import { SecurityLogAction } from "@domifa/common";

export type SuspiciousUserProfile = "user_structure" | "user_supervisor";

export type SuspiciousFilterUserType =
  | SuspiciousUserProfile
  | "usager"
  | "anonymous"
  | "system";

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

export interface SuspiciousActivityLog {
  uuid: string;
  action: SecurityLogAction;
  createdAt: string;
  userType?: string;
  ip?: string | null;
  userAgent?: string | null;
  context: Record<string, unknown> | null;
  resolvedUser?: SuspiciousResolvedUser;
}

export interface SuspiciousActivityFilters {
  actions?: SecurityLogAction[];
  dateFrom?: string;
  dateTo?: string;
  ip?: string;
  identifier?: string;
  userId?: number;
  userType?: SuspiciousFilterUserType;
}
