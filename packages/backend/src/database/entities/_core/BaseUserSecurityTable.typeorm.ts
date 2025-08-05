import { Column } from "typeorm";
import {
  UserSecurity,
  UserSecurityEvent,
  UserTokens,
} from "../../../_common/model";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
export abstract class BaseUserSecurityTable<TUserTable>
  extends AppTypeormTable<BaseUserSecurityTable<TUserTable>>
  implements UserSecurity
{
  public abstract userId: number;
  public abstractstructureId?: number;

  @Column({ type: "jsonb", default: () => "'[]'" })
  eventsHistory: UserSecurityEvent[];

  @Column({ type: "jsonb", nullable: true })
  temporaryTokens: UserTokens;

  public constructor(entity?: Partial<BaseUserSecurityTable<TUserTable>>) {
    super(entity);
    Object.assign(this, entity);
  }
}
