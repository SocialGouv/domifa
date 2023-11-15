import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { StructureTable, UsagerTable } from "..";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserUsagerLogin } from "@domifa/common";

@Entity({ name: "user_usager_login" })
@Index("idx_user_usager_login", ["structureId", "usagerUUID"])
export class UserUsagerLoginTable
  extends AppTypeormTable<UserUsagerLoginTable>
  implements UserUsagerLogin
{
  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  public constructor(entity?: Partial<UserUsagerLoginTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
