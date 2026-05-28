import { SecurityLogAction } from "@domifa/common";

export type SuspiciousUserProfile = "user_structure" | "user_supervisor";

export interface SuspiciousResolvedUser {
  userType: SuspiciousUserProfile;
  userId: number;
  fullName: string;
  email: string;
  role?: string;
  status?: string;
  structureId?: number;
  uuid?: string;
}

export interface SuspiciousActivityLog {
  uuid: string;
  action: SecurityLogAction;
  createdAt: string;
  userType?: string;
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
  userType?: SuspiciousUserProfile;
}
