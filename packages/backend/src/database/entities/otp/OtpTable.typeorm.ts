import { Column, Entity, Index } from "typeorm";
import { UserProfile } from "../../../_common/model";
import { OtpPurpose } from "../../../modules/otp/otp.types";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

@Entity({ name: "otp" })
export class OtpTable extends AppTypeormTable<OtpTable> {
  @Column({ type: "text" })
  email: string;

  @Column({ type: "text" })
  code: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @Column({ type: "integer", default: 0 })
  attempts: number;

  @Column({ type: "boolean", default: false })
  used: boolean;

  @Column({ type: "text" })
  purpose: OtpPurpose;

  @Index()
  @Column({ type: "text" })
  fingerprintHash: string;

  @Column({ type: "text" })
  url: string;

  @Column({ type: "uuid", nullable: true })
  userUuid: string | null;

  @Column({ type: "text" })
  userType: UserProfile;

  @Column({ type: "integer", default: 0 })
  resendCount: number;
}
