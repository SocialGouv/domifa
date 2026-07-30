import { MoreThanOrEqual } from "typeorm";

import { myDataSource } from "..";
import { UserProfile } from "../../../_common/model";
import { OtpPurpose } from "../../../modules/otp/otp.types";
import { OtpTable } from "../../entities/otp/OtpTable.typeorm";

export interface OtpKey {
  fingerprintHash: string;
  url: string;
  purpose: OtpPurpose;
}

export interface NewOtpInput extends OtpKey {
  email: string;
  code: string;
  expiresAt: Date;
  userType: UserProfile;
  userUuid: string;
}

export interface ActiveOtpHmac {
  code: string;
}

export interface BlockedOtpMarker {
  updatedAt: Date;
}

export interface PendingOtpAttempts {
  attempts: number;
}

export const otpRepository = myDataSource.getRepository(OtpTable).extend({
  async findActiveByFingerprint(
    fingerprintHash: string,
    maxAttempts: number,
    userUuid: string
  ): Promise<ActiveOtpHmac | null> {
    const row = await this.createQueryBuilder("otp")
      .select(["otp.code"])
      .where("otp.fingerprintHash = :fingerprintHash", { fingerprintHash })
      .andWhere("otp.used = false")
      .andWhere(`otp."expiresAt" > :now`, { now: new Date() })
      .andWhere("otp.attempts < :maxAttempts", { maxAttempts })
      .andWhere(`otp."userUuid" = :userUuid`, { userUuid })
      .orderBy(`otp."createdAt"`, "DESC")
      .limit(1)
      .getOne();
    return row ? { code: row.code } : null;
  },

  // Atomic verify + consume. Sets used=true only if all guards hold
  // (matching HMAC + not expired + not already consumed + attempts < max).
  // Returns true on success, false if any guard fails.
  async consumeOtpIfCodeMatches(
    key: OtpKey,
    codeHmac: string,
    maxAttempts: number
  ): Promise<boolean> {
    const result = await this.createQueryBuilder()
      .update(OtpTable)
      .set({ used: true, usedAt: () => "NOW()" })
      .where(`"fingerprintHash" = :fingerprintHash`, {
        fingerprintHash: key.fingerprintHash,
      })
      .andWhere(`"url" = :url`, { url: key.url })
      .andWhere(`"purpose" = :purpose`, { purpose: key.purpose })
      .andWhere(`"code" = :codeHmac`, { codeHmac })
      .andWhere(`"expiresAt" > :now`, { now: new Date() })
      .andWhere(`"used" = false`)
      .andWhere(`"attempts" < :maxAttempts`, { maxAttempts })
      .returning("*")
      .execute();
    return (result.raw?.length ?? 0) > 0;
  },

  async incrementPendingAttempts(
    key: OtpKey,
    maxAttempts: number
  ): Promise<PendingOtpAttempts | null> {
    const result = (await this.query(
      `UPDATE "otp"
       SET "attempts" = "otp"."attempts" + 1,
           "updatedAt" = NOW()
       FROM (
         SELECT "uuid" FROM "otp"
         WHERE "fingerprintHash" = $1
           AND "url" = $2
           AND "purpose" = $3
           AND "used" = false
           AND "expiresAt" > $4
           AND "attempts" < $5
         ORDER BY "createdAt" DESC
         LIMIT 1
       ) sub
       WHERE "otp"."uuid" = sub."uuid"
       RETURNING "otp"."attempts"`,
      [key.fingerprintHash, key.url, key.purpose, new Date(), maxAttempts]
    )) as [Array<{ attempts: number }>, number];
    const rows = result?.[0];
    return rows?.[0] ? { attempts: rows[0].attempts } : null;
  },

  async findRecentBlocked(
    key: OtpKey,
    maxAttempts: number,
    blockDurationMs: number
  ): Promise<BlockedOtpMarker | null> {
    const since = new Date(Date.now() - blockDurationMs);
    const row = await this.createQueryBuilder("otp")
      .select(["otp.updatedAt"])
      .where("otp.fingerprintHash = :fingerprintHash", {
        fingerprintHash: key.fingerprintHash,
      })
      .andWhere("otp.url = :url", { url: key.url })
      .andWhere("otp.purpose = :purpose", { purpose: key.purpose })
      .andWhere("otp.attempts >= :maxAttempts", { maxAttempts })
      .andWhere(`otp."updatedAt" > :since`, { since })
      .orderBy(`otp."updatedAt"`, "DESC")
      .limit(1)
      .getOne();
    return row?.updatedAt ? { updatedAt: row.updatedAt } : null;
  },

  async createOtp(input: NewOtpInput): Promise<void> {
    await this.save({
      email: input.email,
      code: input.code,
      expiresAt: input.expiresAt,
      purpose: input.purpose,
      fingerprintHash: input.fingerprintHash,
      url: input.url,
      userType: input.userType,
      userUuid: input.userUuid,
    });
  },

  // Resets the attempts counter on every blocking OTP row attributed to a
  // given user. Called after a successful password reset/change: the user
  // has proven their identity, so any prior lockout from bad OTP codes is
  // lifted. Rows are kept for audit; `findRecentBlocked` just won't match
  // them anymore.
  async resetBlockedOtpsForUser(
    userUuid: string,
    maxAttempts: number
  ): Promise<number> {
    const result = await this.update(
      { userUuid, attempts: MoreThanOrEqual(maxAttempts) },
      { attempts: 0 }
    );
    return result.affected ?? 0;
  },
});
