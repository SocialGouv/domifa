import { AppEntity } from "@domifa/common";
import {
  CurrentUserSession,
  HistoricalUserSession,
} from "./UserSessionRecord.interface";
import { UserTokens } from "./UserTokens.interface";

export interface UserSecurity extends AppEntity {
  userId: number;
  temporaryTokens?: UserTokens; // used on creation & reset password
  structureId?: number;
  // Flat, indexed denormalization of `currentSession.fingerprintHash`.
  // Kept in sync by SessionFingerprintService on every write so we can
  // look up sessions by hash without parsing the JSON column.
  fingerprintHash?: string | null;
  // Current active session. NULL when the user has no active session.
  currentSession?: CurrentUserSession | null;
  // Past sessions, most recent first.
  sessionsHistory?: HistoricalUserSession[];
}
