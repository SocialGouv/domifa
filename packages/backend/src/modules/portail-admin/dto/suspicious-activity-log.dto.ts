import { AppLogActorType } from "../../app-logs/types";
import { SuspiciousLogAction } from "../../security-monitoring/types/security-alert.types";
import { SuspiciousUserProfile } from "./suspicious-activity-query.dto";

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

export interface SuspiciousActivityLogDto {
  uuid: string;
  action: SuspiciousLogAction;
  createdAt: Date;
  userType?: AppLogActorType;
  context: Record<string, unknown> | null;
  resolvedUser?: SuspiciousResolvedUser;
}
