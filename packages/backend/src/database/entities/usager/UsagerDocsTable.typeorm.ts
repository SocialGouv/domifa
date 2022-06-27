import { UsagerDoc } from "../../../_common/model/usager/UsagerDoc.type";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager_docs" })
export class UsagerDocsTable
  extends AppTypeormTable<UsagerDocsTable>
  implements UsagerDoc
{
  @Index()
  @Column({ type: "uuid", update: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid)
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id)
  @Column({ type: "integer", update: false, nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "integer", update: false, nullable: false })
  public usagerRef: number;

  @Column({ type: "text", nullable: false })
  public path: string;

  @Column({ type: "text", nullable: false })
  public label: string;

  @Column({ type: "text", nullable: false })
  public filetype: string;

  @Column({ type: "text", nullable: false })
  public createdBy: string;

  public constructor(entity?: Partial<UsagerDocsTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
