import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import {
  UserStructureSecurity,
  UserStructureSecurityEvent,
  UserStructureTokens,
} from "../../../_common/model";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserStructureTable } from "./UserStructureTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "user_structure_security" })
export class UserStructureSecurityTable
  extends AppTypeormTable<UserStructureSecurityTable>
  implements UserStructureSecurity
{
  @Index()
  @ManyToOne(() => UserStructureTable, (user) => user.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  public userId: number;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "jsonb", nullable: true })
  temporaryTokens: UserStructureTokens;

  @Column({ type: "jsonb", default: () => "'[]'" })
  eventsHistory: UserStructureSecurityEvent[];

  public constructor(entity?: Partial<UserStructureSecurityTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
