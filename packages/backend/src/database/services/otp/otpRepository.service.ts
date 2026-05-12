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

  async incrementAttempts(uuid: string): Promise<void> {
    await this.createQueryBuilder()
      .update(OtpTable)
      .set({ attempts: () => "attempts + 1" })
      .where("uuid = :uuid", { uuid })
      .execute();
  },
});
