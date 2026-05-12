import { Injectable } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
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
  // SHA-256 of "userUUID|ipAddress|userAgent|salt". One-way: we only ever
  // recompare against a freshly recomputed hash, never reverse it. The
  // salt is the per-session value stored in `currentSession.salt` — never
  // sent to the client, so even a leaked JWT signing key can't be used to
  // forge a valid hash without DB access.
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

  // Reuse the user's active session if any, otherwise create a new one.
  // Phase 2 (post-2FA) will replace this with a 2FA-gated creation flow.
  public async getOrCreateSession(
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
      // Same user, active session already, but logging in from a different
      // context (IP and/or UA). v1: log only, reuse the existing session.
      // Phase 3 will likely treat this as a re-auth trigger.
      const ipChanged = row.currentSession.ipAddress !== ipAddress;
      const userAgentChanged = row.currentSession.userAgent !== userAgent;
      if (ipChanged || userAgentChanged) {
        appLogger.warn({
          event: "session_login_context_changed",
          profile,
          userId,
          structureId: row.structureId ?? null,
          sessionUuid: row.currentSession.uuid,
          oldIp: row.currentSession.ipAddress,
          newIp: ipAddress,
          ipChanged,
          oldUserAgent: row.currentSession.userAgent,
          newUserAgent: userAgent,
          userAgentChanged,
        });
      }
      return row.currentSession;
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

  // v1 observation: never throws. Logs on mismatch and bumps lastVerifiedAt.
  // Phase 2 will switch to a throwing variant once log analysis is done.
  public async verifySessionFromJwt(
    profile: SessionProfile,
    userId: number,
    userUUID: string,
    jwtFingerprintHash: string,
    currentIp: string,
    currentUserAgent: string
  ): Promise<void> {
    const row = await this.loadSecurityRow(profile, userId);
    if (!row) {
      appLogger.warn({
        event: "session_fingerprint_no_security_row",
        profile,
        userId,
      });
      return;
    }

    const session = row.currentSession;
    if (!session) {
      appLogger.warn({
        event: "session_fingerprint_no_active_session",
        profile,
        userId,
      });
      return;
    }

    const calculatedHash = this.computeFingerprint(
      userUUID,
      currentIp,
      currentUserAgent,
      session.salt
    );

    if (calculatedHash !== jwtFingerprintHash) {
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
        actualHashPrefix: calculatedHash.substring(0, 8),
      });
    }

    row.currentSession = {
      ...session,
      lastVerifiedAt: new Date().toISOString(),
    };
    await this.persistRow(profile, row);
  }

  public async closeActiveSession(
    profile: SessionProfile,
    userId: number,
    reason: SessionClosedReason
  ): Promise<void> {
    const row = await this.loadSecurityRow(profile, userId);
    if (!row || !row.currentSession) {
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
