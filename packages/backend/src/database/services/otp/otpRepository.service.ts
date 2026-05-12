import { myDataSource } from "..";
import { OtpTable } from "../../entities/otp/OtpTable.typeorm";

export const otpRepository = myDataSource.getRepository(OtpTable).extend({
  async claimValidOtp(
    email: string,
    hashedCode: string,
    maxAttempts: number
  ): Promise<OtpTable | null> {
    const result = await this.createQueryBuilder()
      .update(OtpTable)
      .set({ used: true })
      .where("email = :email", { email })
      .andWhere("code = :hashedCode", { hashedCode })
      .andWhere(`"expiresAt" > :now`, { now: new Date() })
      .andWhere("used = false")
      .andWhere("attempts < :maxAttempts", { maxAttempts })
      .returning("*")
      .execute();
    return (result.raw?.[0] as OtpTable) ?? null;
  },

  async countRecentByEmail(
    email: string,
    windowMinutes: number
  ): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    return this.createQueryBuilder("otp")
      .where("otp.email = :email", { email })
      .andWhere("otp.createdAt > :since", { since })
      .getCount();
  },

  // Atomic increment of the latest eligible (non-used, non-expired,
  // attempts < max) pending OTP for the given email, in a single SQL
  // statement. Avoids the check-then-update race on `attempts`.
  // Returns the updated row, or null if no eligible OTP exists.
  async incrementLatestPendingAttempts(
    email: string,
    maxAttempts: number
  ): Promise<OtpTable | null> {
    // TypeORM's raw query returns [rows, rowCount] for UPDATE statements,
    // not just rows (see TypeORM PostgresQueryRunner.query()).
    const result = (await this.query(
      `UPDATE "otp"
       SET "attempts" = "otp"."attempts" + 1,
           "updatedAt" = NOW()
       FROM (
         SELECT "uuid" FROM "otp"
         WHERE "email" = $1
           AND "used" = false
           AND "expiresAt" > $2
           AND "attempts" < $3
         ORDER BY "createdAt" DESC
         LIMIT 1
       ) sub
       WHERE "otp"."uuid" = sub."uuid"
       RETURNING "otp".*`,
      [email, new Date(), maxAttempts]
    )) as [OtpTable[], number];
    const rows = result?.[0];
    return rows?.[0] ?? null;
  },
});
