import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";

import {
  UsagerLien,
  UsagerLienType,
  UserStructureResume,
} from "@domifa/common";

// "Mirrored rows" storage: linking A to B creates one row
// (usagerUUID: A, linkedUsagerUUID: B) and a symmetric row
// (usagerUUID: B, linkedUsagerUUID: A), always within the same transaction
// (see UsagerLienService.link/unlink). The UNIQUE constraint on
// "usagerUUID" enforces the 1-1 rule at the DB level: a usager can never be
// "usagerUUID" on more than one row. The two CASCADE FKs mean deleting a
// usager automatically deletes both sides of the link, with no dedicated
// application code.
@Entity({ name: "usager_lien" })
@Check("CHK_usager_lien_not_self", `"usagerUUID" <> "linkedUsagerUUID"`)
export class UsagerLienTable
  extends AppTypeormTable<UsagerLienTable>
  implements UsagerLien
{
  @Index()
  @Column({ type: "uuid", nullable: false, unique: true })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Index()
  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "linkedUsagerUUID", referencedColumnName: "uuid" })
  public linkedUsagerUUID: string;

  @Column({ type: "text", nullable: false, default: "CONJOINT" })
  public type: UsagerLienType;

  @Index()
  @Column({ type: "integer", nullable: false })
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "jsonb", nullable: true })
  public createdBy: UserStructureResume;

  public constructor(entity?: Partial<UsagerLienTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
