import {
  AppEntity,
  SecurityLogAction,
  UserStructureRole,
  UserSupervisorRole,
} from "@domifa/common";
import { AppLogActorType } from "./AppLog.type";

// Row shape of the dedicated `app_log_security` table. Trimmed vs `AppLog`:
// only the subject of the security event is kept (userStructureId or
// userSupervisorId). Anything else relevant to the audit (target usager,
// raw payload, etc.) goes into `context`. `ip` and `userAgent` are promoted
// to first-class columns so security-monitoring queries can filter/aggregate
// without JSON ops.
export type AppLogSecurity<T = any> = AppEntity & {
  userStructureId?: number;
  userSupervisorId?: number;
  userUsagerId?: number;
  userType?: AppLogActorType;
  structureId?: number;
  action: SecurityLogAction;
  context?: T;
  role?: UserStructureRole | UserSupervisorRole;
  createdBy?: string;
  ip?: string;
  userAgent?: string;
  // Display name ("prenom nom") of the subject, captured at write time.
  userName?: string;
};
