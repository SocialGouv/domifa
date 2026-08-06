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
import { normalizeUserAgent } from "../../util/express";
import { logSecurityEvent } from "../../modules/app-logs/app-log-security-writer";

export type SessionProfile = "structure" | "supervisor";

type SessionSecurityRow = {
  uuid?: string;
  userId: number;
  structureId?: number | null;
  currentSession: CurrentUserSession | null;
  sessionsHistory: HistoricalUserSession[];
};

function syncFingerprintHash(
  currentSession: CurrentUserSession | null
): string | null {
  return currentSession?.fingerprintHash ?? null;
}

@Injectable()
export class SessionFingerprintService {
  public computeFingerprint(
    userUUID: string,
    userAgent: string,
    salt: string
  ): string {
    return createHash("sha256")
      .update(`${userUUID}|${userAgent}|${salt}`)
      .digest("hex");
  }

  public async startNewSession(
    profile: SessionProfile,
    userId: number,
    userUUID: string,
    ipAddress: string,
    userAgent: string,
    structureId?: number
  ): Promise<CurrentUserSession> {
    const normalizedUserAgent = normalizeUserAgent(userAgent);
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
        userAgentChanged: previous.userAgent !== normalizedUserAgent,
      });
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
        normalizedUserAgent,
        salt
      ),
      ipAddress,
      userAgent: normalizedUserAgent,
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
    const session = row?.currentSession ?? null;
    if (!session) {
      return null;
    }
    // A session past its own expiry is not active: the trust token must not
    // outlive it just because its 30-day JWT is still signed.
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return null;
    }
    return session;
  }

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
      await this.recordJwtStrategyStaleTrust(
        profile,
        userId,
        undefined,
        "no_security_row",
        currentIp,
        currentUserAgent
      );
      return false;
    }

    const session = row.currentSession;
    if (!session) {
      appLogger.warn({
        event: "session_fingerprint_no_active_session",
        profile,
        userId,
      });
      await this.recordJwtStrategyStaleTrust(
        profile,
        userId,
        row.structureId ?? undefined,
        "no_active_session",
        currentIp,
        currentUserAgent
      );
      return false;
    }

    if (!constantTimeStringEqual(session.fingerprintHash, jwtFingerprintHash)) {
      const normalizedCurrentUserAgent = normalizeUserAgent(currentUserAgent);
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
        newUserAgent: normalizedCurrentUserAgent,
        userAgentChanged: session.userAgent !== normalizedCurrentUserAgent,
        expectedHashPrefix: jwtFingerprintHash.substring(0, 8),
        actualHashPrefix: session.fingerprintHash.substring(0, 8),
      });
      await this.recordJwtStrategyStaleTrust(
        profile,
        userId,
        row.structureId ?? undefined,
        "hash_mismatch",
        currentIp,
        currentUserAgent
      );
      return false;
    }

    row.currentSession = {
      ...session,
      lastVerifiedAt: new Date().toISOString(),
    };
    await this.persistRow(profile, row);
    return true;
  }

  // Endpoint counterpart of LoginOtpService.recordTrustTokenEvent: whenever
  // a live request presents a JWT that no longer aligns with the stored
  // session (rotated / closed / row missing), we surface the disconnection
  // in app_log_security so the fingerprint study covers both the login and
  // per-request paths. Scoped to structure for now — phase 1 observation
  // only concerns user_structure.
  private async recordJwtStrategyStaleTrust(
    profile: SessionProfile,
    userId: number,
    structureId: number | undefined,
    reason: "no_security_row" | "no_active_session" | "hash_mismatch",
    ip: string,
    userAgent: string
  ): Promise<void> {
    if (profile !== "structure") {
      return;
    }
    await logSecurityEvent({
      action: "TRUST_TOKEN_EXPIRED",
      profile: "structure",
      userId,
      structureId,
      requestContext: { ip, userAgent },
      context: { origin: "jwt_strategy", reason },
    });
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

function constantTimeStringEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ab, bb);
}
