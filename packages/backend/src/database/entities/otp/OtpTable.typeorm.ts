import { Column, Entity, Index } from "typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

@Entity({ name: "otp" })
export class OtpTable extends AppTypeormTable<OtpTable> {
  @Index()
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
