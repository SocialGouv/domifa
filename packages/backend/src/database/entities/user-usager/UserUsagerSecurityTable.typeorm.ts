import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import {
  UserUsagerSecurity,
  UserUsagerSecurityEvent,
} from "../../../_common/model";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserUsagerTable } from "./UserUsagerTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "user_usager_security" })
export class UserUsagerSecurityTable
  extends AppTypeormTable<UserUsagerSecurityTable>
  implements UserUsagerSecurity
{
  @Index()
  @ManyToOne(() => UserUsagerTable, (user) => user.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false, unique: true, update: false })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  public userId: number;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "jsonb", default: () => "'[]'" })
  eventsHistory: UserUsagerSecurityEvent[];

  public constructor(entity?: Partial<UserUsagerSecurityTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
