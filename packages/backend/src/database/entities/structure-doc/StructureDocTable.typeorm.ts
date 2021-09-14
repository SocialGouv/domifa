import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { StructureDoc } from "../../../_common/model/structure-doc";
import { UserStructureCreatedBy } from "../../../_common/model/user-structure/UserStructureCreatedBy.type";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

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

  @Column({ type: "jsonb", nullable: true })
  tags: {
    [key: string]: string;
  };

  @Column({ type: "boolean", nullable: false, default: false })
  custom: boolean;

  @Column({ type: "text", nullable: false })
  filetype: string;

  @Index()
  @Column({ type: "integer", nullable: false })
  structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureFk?: Promise<StructureTable>;

  @Column({ type: "text", nullable: false })
  path: string;

  public constructor(entity?: Partial<StructureDocTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
