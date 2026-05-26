import { Injectable } from "@nestjs/common";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { domifaConfig } from "../../config";
import {
  userStructureSecurityRepository,
  userSupervisorSecurityRepository,
} from "../../database";
import {
  CurrentUserSession,
  HistoricalUserSession,
  SessionClosedReason,
} from "../../_common/model";
import { appLogger } from "../../util";

export type SessionProfile = "structure" | "supervisor";

type SessionSecurityRow = {
  uuid?: string;
  userId: number;
  structureId?: number | null;
  currentSession: CurrentUserSession | null;
  sessionsHistory: HistoricalUserSession[];
};

// `fingerprintHash` column is denormalized from currentSession on every
// write. Always derive it here to keep the two in sync.
function syncFingerprintHash(
  currentSession: CurrentUserSession | null
): string | null {
  return currentSession?.fingerprintHash ?? null;
}

@Injectable()
export class SessionFingerprintService {
  // SHA-256 of "userUUID|ipAddress|userAgent|salt". Computed once at login
  // (the inputs are the request that opened the session) and then treated as
  // an opaque session token: stored on the session row, embedded in the JWT,
  // and compared verbatim by `verifySessionFromJwt` — we never recompute it
  // from the current request. So a later request from a different IP or
  // browser does NOT invalidate the session.
  public computeFingerprint(
    userUUID: string,
    ipAddress: string,
    userAgent: string,
    salt: string
  ): string {
    return createHash("sha256")
      .update(`${userUUID}|${ipAddress}|${userAgent}|${salt}`)
      .digest("hex");
  }

  // Every login starts a fresh session. Any prior active session is closed
  // and pushed to history with reason `REPLACED`. The new JWT carries the
  // new fingerprint hash, so the previous device's JWT (still holding the
  // old hash) will mismatch on subsequent verifications.
  public async startNewSession(
    profile: SessionProfile,
    userId: number,
    userUUID: string,
    ipAddress: string,
    userAgent: string,
    structureId?: number
  ): Promise<CurrentUserSession> {
    const row = await this.loadOrCreateSecurityRow(
      profile,
      userId,
      structureId
    );

    if (row.currentSession) {
      const previous = row.currentSession;
      const closed: HistoricalUserSession = {
        ...previous,
        closedAt: new Date().toISOString(),
        closedReason: "REPLACED",
      };
      appLogger.info({
        event: "session_replaced_on_login",
        profile,
        userId,
        structureId: row.structureId ?? null,
        previousSessionUuid: previous.uuid,
        ipChanged: previous.ipAddress !== ipAddress,
        userAgentChanged: previous.userAgent !== userAgent,
      });
      // Most recent first to keep lookups cheap in the array.
      row.sessionsHistory = [closed, ...row.sessionsHistory];
      row.currentSession = null;
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(
      expiresAt.getDate() + domifaConfig().security.sessionDurationDays
    );

    const salt = randomUUID();
    const session: CurrentUserSession = {
      uuid: randomUUID(),
      salt,
      fingerprintHash: this.computeFingerprint(
        userUUID,
        ipAddress,
        userAgent,
        salt
      ),
      ipAddress,
      userAgent,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastVerifiedAt: null,
    };

    row.currentSession = session;
    await this.persistRow(profile, row);

    return session;
  }

  public async findActiveSession(
    profile: SessionProfile,
    userId: number
  ): Promise<CurrentUserSession | null> {
    const row = await this.loadSecurityRow(profile, userId);
    return row?.currentSession ?? null;
  }

  // Returns true if the JWT's fingerprint matches the active session.
  // Returns false (and logs) on any condition that should force the caller
  // to log out: no security row, no active session, or a hash mismatch.
  // The fingerprint is treated as an opaque token here — we compare it
  // verbatim against the stored value, we never recompute it from the
  // current request. A mismatch therefore means the session was replaced
  // (newer login on another device) or revoked — the old JWT must be
  // rejected. `currentIp` / `currentUserAgent` are kept on the signature
  // for structured logging on mismatch.
  public async verifySessionFromJwt(
    profile: SessionProfile,
    userId: number,
    _userUUID: string,
    jwtFingerprintHash: string,
    currentIp: string,
    currentUserAgent: string
  ): Promise<boolean> {
    const row = await this.loadSecurityRow(profile, userId);
    if (!row) {
      appLogger.warn({
        event: "session_fingerprint_no_security_row",
        profile,
        userId,
      });
      return false;
    }

    const session = row.currentSession;
    if (!session) {
      appLogger.warn({
        event: "session_fingerprint_no_active_session",
        profile,
        userId,
      });
      return false;
    }

    if (!constantTimeStringEqual(session.fingerprintHash, jwtFingerprintHash)) {
      // Mismatch: log structured context, never the full hash (session secret).
      appLogger.warn({
        event: "session_fingerprint_mismatch",
        profile,
        userId,
        structureId: row.structureId ?? null,
        sessionUuid: session.uuid,
        oldIp: session.ipAddress,
        newIp: currentIp,
        ipChanged: session.ipAddress !== currentIp,
        oldUserAgent: session.userAgent,
        newUserAgent: currentUserAgent,
        userAgentChanged: session.userAgent !== currentUserAgent,
        expectedHashPrefix: jwtFingerprintHash.substring(0, 8),
        actualHashPrefix: session.fingerprintHash.substring(0, 8),
      });
      return false;
    }

    row.currentSession = {
      ...session,
      lastVerifiedAt: new Date().toISOString(),
    };
    await this.persistRow(profile, row);
    return true;
  }

  public async closeActiveSession(
    profile: SessionProfile,
    userId: number,
    reason: SessionClosedReason
  ): Promise<void> {
    const row = await this.loadSecurityRow(profile, userId);
    if (!row?.currentSession) {
      return;
    }

    const closed: HistoricalUserSession = {
      ...row.currentSession,
      closedAt: new Date().toISOString(),
      closedReason: reason,
    };

    appLogger.info({
      event: "session_closed",
      profile,
      userId,
      sessionUuid: closed.uuid,
      reason,
    });

    row.currentSession = null;
    // Most recent first to keep lookups cheap in the array.
    row.sessionsHistory = [closed, ...row.sessionsHistory];
    await this.persistRow(profile, row);
  }

  private async loadSecurityRow(
    profile: SessionProfile,
    userId: number
  ): Promise<SessionSecurityRow | null> {
    if (profile === "structure") {
      const row = await userStructureSecurityRepository.findOne({
        where: { userId },
      });
      return row
        ? {
            uuid: row.uuid,
            userId: row.userId,
            structureId: row.structureId,
            currentSession: row.currentSession ?? null,
            sessionsHistory: row.sessionsHistory ?? [],
          }
        : null;
    }
    const row = await userSupervisorSecurityRepository.findOne({
      where: { userId },
    });
    return row
      ? {
          uuid: row.uuid,
          userId: row.userId,
          currentSession: row.currentSession ?? null,
          sessionsHistory: row.sessionsHistory ?? [],
        }
      : null;
  }

  private async loadOrCreateSecurityRow(
    profile: SessionProfile,
    userId: number,
    structureId?: number
  ): Promise<SessionSecurityRow> {
    const existing = await this.loadSecurityRow(profile, userId);
    if (existing) {
      return existing;
    }
    // A login without a pre-existing security row is a legacy case (the row
    // is normally created at user creation). We backfill on the fly rather
    // than failing the login.
    return {
      userId,
      structureId: profile === "structure" ? structureId ?? null : undefined,
      currentSession: null,
      sessionsHistory: [],
    };
  }

  private async persistRow(
    profile: SessionProfile,
    row: SessionSecurityRow
  ): Promise<void> {
    const fingerprintHash = syncFingerprintHash(row.currentSession);
    if (profile === "structure") {
      await userStructureSecurityRepository.save({
        uuid: row.uuid,
        userId: row.userId,
        structureId: row.structureId ?? undefined,
        fingerprintHash,
        currentSession: row.currentSession,
        sessionsHistory: row.sessionsHistory,
      });
      return;
    }
    await userSupervisorSecurityRepository.save({
      uuid: row.uuid,
      userId: row.userId,
      fingerprintHash,
      currentSession: row.currentSession,
      sessionsHistory: row.sessionsHistory,
    });
  }
}

// Constant-time equality on two strings. `timingSafeEqual` requires buffers
// of identical length, so we short-circuit on length mismatch (which is
// itself non-secret information — the stored hash length is fixed).
function constantTimeStringEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ab, bb);
}
