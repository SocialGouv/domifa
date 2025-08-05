import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { BaseUserSecurityTable } from "../_core/BaseUserSecurityTable.typeorm";
import { UserUsagerTable } from "./UserUsagerTable.typeorm";
import { StructureTable } from "../structure";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "user_usager_security" })
@Unique(["userId", "structureId"])
export class UserUsagerSecurityTable extends BaseUserSecurityTable<UserUsagerTable> {
  @Index()
  @ManyToOne(() => UserUsagerTable, (user) => user.id, {
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
  public structureId?: number;

  public constructor(entity?: Partial<UserUsagerSecurityTable>) {
    super(entity);
  }
}
