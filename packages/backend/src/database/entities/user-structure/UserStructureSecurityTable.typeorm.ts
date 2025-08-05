import { Index, ManyToOne, Column, JoinColumn, Entity } from "typeorm";
import { BaseUserSecurityTable } from "../_core/BaseUserSecurityTable.typeorm";
import { UserStructureTable } from "./UserStructureTable.typeorm";
import { StructureTable } from "../structure";

@Entity({ name: "user_structure_security" })
// @Unique(["userId", "structureId"] ) TODO: after migration
export class UserStructureSecurityTable extends BaseUserSecurityTable<UserStructureTable> {
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
  @Column({ type: "integer", nullable: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId?: number;

  public constructor(entity?: Partial<UserStructureSecurityTable>) {
    super(entity);
  }
}
