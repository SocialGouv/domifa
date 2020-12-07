import { Column, Entity, Generated, Index } from "typeorm";

import { StructureCustomDocs } from "../../../_common/model/structure-custom-docs";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure_custom_docs" })
export class StructureCustomDocsTable
  extends AppTypeormTable<StructureCustomDocsTable>
  implements StructureCustomDocs {
  @Index()
  @Column({ type: "text", nullable: false })
  label: string;

  @Column({ type: "text", nullable: false })
  createdBy: string;

  @Column({ type: "jsonb" })
  tags: any;

  @Column({ type: "text", nullable: false })
  type: "custom" | "plain";

  @Column({ type: "text", nullable: false })
  filetype: string;

  @Column({ type: "text", nullable: false })
  path: string;
}
