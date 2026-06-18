import { Column, Entity } from "typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

export type AppIpBanReason =
  | "THROTTLE_VIOLATION"
  | "BOT_UA"
  | "MISSING_UA"
  | "MANUAL";

@Entity({ name: "app_ip_ban" })
export class AppIpBanTable extends AppTypeormTable<AppIpBanTable> {
  @Column({ type: "text" })
  public ip!: string;

  @Column({ type: "text" })
  public reason!: AppIpBanReason;

  // null = permanent ban (medium/long throttle tiers, manual block).
  // Cache layer filters expired bans in memory.
  @Column({ type: "timestamptz", nullable: true })
  public expiresAt?: Date | null;

  @Column({ type: "jsonb", nullable: true })
  public context?: any;

  @Column({ type: "text", nullable: true })
  public createdBy?: string | null;

  public constructor(entity?: Partial<AppIpBanTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
