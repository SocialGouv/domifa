import { StructureCustomDocType } from "./../../../_common/model/structure-doc/StructureCustomDocType.type";
import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { StructureDoc } from "../../../_common/model/structure-doc";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UserStructureCreatedBy } from "@domifa/common";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure_doc" })
export class StructureDocTable
  extends AppTypeormTable<StructureDocTable>
  implements StructureDoc
{
  @Index()
  @Column({ type: "integer", unique: true })
  @Generated("increment")
  id: number;

  @Column({ type: "text", nullable: false })
  label: string;

  @Column({ type: "jsonb", nullable: false })
  createdBy: UserStructureCreatedBy;

  @Column({ type: "boolean", nullable: false, default: false })
  custom!: boolean;

  @Column({ type: "text", nullable: true, default: null })
  customDocType!: StructureCustomDocType;

  @Column({ type: "boolean", nullable: false, default: false })
  displayInPortailUsager!: boolean;

  @Column({ type: "text", nullable: false })
  filetype!: string;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false, update: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId!: number;

  @Column({ type: "text", nullable: false })
  public path!: string;

  public constructor(entity?: Partial<StructureDocTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
