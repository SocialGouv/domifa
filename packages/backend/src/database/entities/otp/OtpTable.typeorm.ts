import { Column, Entity, Index } from "typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

@Entity({ name: "otp" })
@Index("IDX_otp_email_used_expires", ["email", "used", "expiresAt"])
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

  @Column({ type: "text", nullable: true })
  purpose: string;
}
