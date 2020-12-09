import { Column, Entity, Generated, Index } from "typeorm";
import { AppUserCreatedBy } from "../../../_common/model/app-user/AppUserCreatedBy.type";

import { StructureDoc } from "../../../_common/model/structure-doc";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure_doc" })
export class StructureDocTable
  extends AppTypeormTable<StructureDocTable>
  implements StructureDoc {
  @Index()
  @Column({ type: "integer", unique: true })
  @Generated("increment")
  id: number;

  @Column({ type: "text", nullable: false })
  label: string;

  @Column({ type: "jsonb", nullable: false })
  createdBy: AppUserCreatedBy;

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

  @Column({ type: "text", nullable: false })
  path: string;
}
