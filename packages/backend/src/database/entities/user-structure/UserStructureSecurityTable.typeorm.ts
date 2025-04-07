import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import {
  UserSecurity,
  UserSecurityEvent,
  UserTokens,
} from "../../../_common/model";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserStructureTable } from "./UserStructureTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "user_structure_security" })
export class UserStructureSecurityTable
  extends AppTypeormTable<UserStructureSecurityTable>
  implements UserSecurity
{
  @Index()
  @ManyToOne(() => UserStructureTable, (user) => user.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  public userId: number;

  @Column({ type: "jsonb", nullable: true })
  temporaryTokens: UserTokens;

  @Column({ type: "jsonb", default: () => "'[]'" })
  eventsHistory: UserSecurityEvent[];

  public constructor(entity?: Partial<UserStructureSecurityTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
