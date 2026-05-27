import { Column, Index } from "typeorm";
import {
  CurrentUserSession,
  HistoricalUserSession,
  UserSecurity,
  UserTokens,
} from "../../../_common/model";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

export abstract class BaseUserSecurityTable<TUserTable>
  extends AppTypeormTable<BaseUserSecurityTable<TUserTable>>
  implements UserSecurity
{
  public abstract userId: number;

  @Column({ type: "jsonb", nullable: true })
  temporaryTokens: UserTokens;

  // Flat indexed copy of `currentSession.fingerprintHash`. Maintained by
  // SessionFingerprintService so a lookup by hash is a plain B-tree probe
  // instead of a JSONB scan.
  @Index()
  @Column({ type: "text", nullable: true })
  fingerprintHash: string | null;

  // Active session for this user. NULL = no active session.
  @Column({ type: "jsonb", nullable: true })
  currentSession: CurrentUserSession | null;

  // Past sessions (closed by logout, expiry, etc.), most recent first.
  // Purged by the session-cleanup CRON.
  @Column({ type: "jsonb", default: () => "'[]'" })
  sessionsHistory: HistoricalUserSession[];

  public constructor(entity?: Partial<BaseUserSecurityTable<TUserTable>>) {
    super(entity);
    Object.assign(this, entity);
  }
}
