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

export const otpRepository = myDataSource.getRepository(OtpTable).extend({
  async findActiveByFingerprint(
    fingerprintHash: string,
    maxAttempts: number,
    userUuid: string
  ): Promise<OtpTable | null> {
    return this.createQueryBuilder("otp")
      .where("otp.fingerprintHash = :fingerprintHash", { fingerprintHash })
      .andWhere("otp.used = false")
      .andWhere(`otp."expiresAt" > :now`, { now: new Date() })
      .andWhere("otp.attempts < :maxAttempts", { maxAttempts })
      .andWhere(`otp."userUuid" = :userUuid`, { userUuid })
      .orderBy(`otp."createdAt"`, "DESC")
      .limit(1)
      .getOne();
  },

  async claimByKey(
    key: OtpKey,
    code: string,
    maxAttempts: number
  ): Promise<OtpTable | null> {
    const result = await this.createQueryBuilder()
      .update(OtpTable)
      .set({ used: true, usedAt: () => "NOW()" })
      .where(`"fingerprintHash" = :fingerprintHash`, {
        fingerprintHash: key.fingerprintHash,
      })
      .andWhere(`"url" = :url`, { url: key.url })
      .andWhere(`"purpose" = :purpose`, { purpose: key.purpose })
      .andWhere(`"code" = :code`, { code })
      .andWhere(`"expiresAt" > :now`, { now: new Date() })
      .andWhere(`"used" = false`)
      .andWhere(`"attempts" < :maxAttempts`, { maxAttempts })
      .returning("*")
      .execute();
    return (result.raw?.[0] as OtpTable) ?? null;
  },

  async incrementPendingAttempts(
    key: OtpKey,
    maxAttempts: number
  ): Promise<OtpTable | null> {
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
       RETURNING "otp".*`,
      [key.fingerprintHash, key.url, key.purpose, new Date(), maxAttempts]
    )) as [OtpTable[], number];
    const rows = result?.[0];
    return rows?.[0] ?? null;
  },

  async findRecentBlocked(
    key: OtpKey,
    maxAttempts: number,
    blockDurationMs: number
  ): Promise<OtpTable | null> {
    const since = new Date(Date.now() - blockDurationMs);
    return this.createQueryBuilder("otp")
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
  },

  async createOtp(input: NewOtpInput): Promise<OtpTable> {
    return this.save({
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

  // Resend path: we never store the plaintext code, so each resend mints a
  // fresh code and overwrites the row's HMAC + bumps resendCount atomically.
  // `attempts` is intentionally NOT reset — wrong-code attempts on the
  // previous code still count toward the lockout.
  async refreshCodeAndIncrementResend(
    uuid: string,
    codeHmac: string
  ): Promise<OtpTable | null> {
    const result = await this.createQueryBuilder()
      .update(OtpTable)
      .set({
        code: codeHmac,
        resendCount: () => `"resendCount" + 1`,
      })
      .where("uuid = :uuid", { uuid })
      .returning("*")
      .execute();
    return (result.raw?.[0] as OtpTable) ?? null;
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
