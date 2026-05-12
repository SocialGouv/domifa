import { myDataSource } from "..";
import { OtpTable } from "../../entities/otp/OtpTable.typeorm";

export const otpRepository = myDataSource.getRepository(OtpTable).extend({
  async findValidOtp(
    email: string,
    hashedCode: string,
    maxAttempts: number
  ): Promise<OtpTable | null> {
    return this.createQueryBuilder("otp")
      .where("otp.email = :email", { email })
      .andWhere("otp.code = :hashedCode", { hashedCode })
      .andWhere("otp.expiresAt > :now", { now: new Date() })
      .andWhere("otp.used = false")
      .andWhere("otp.attempts < :maxAttempts", { maxAttempts })
      .getOne();
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
