import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Interactions } from "../../../_common/model/interaction";
import { InteractionType } from "@domifa/common";

import { StructureTable } from "../structure/StructureTable.typeorm";
import { UsagerTable } from "../usager";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "interactions" })
@Index("idx_interactions_date", [
  "structureId",
  "usagerUUID",
  "dateInteraction",
])
@Index("idx_interactions_type", ["structureId", "usagerUUID", "type"])
export class InteractionsTable
  extends AppTypeormTable<InteractionsTable>
  implements Interactions
{
  @Index()
  @Column({ type: "timestamptz" })
  dateInteraction: Date;

  @Column({ type: "integer", default: 0, nullable: false })
  nbCourrier: number;

  @Index()
  @Column({ type: "text", nullable: false })
  type: InteractionType;

  @Column({ type: "integer", nullable: false })
  usagerRef: number;

  @Column({ type: "integer", nullable: true }) // nullable if user is deleted
  userId: number;

  @Column({ type: "text" })
  userName: string;

  @Column({ type: "text", nullable: true })
  content: string;

  @Index()
  @Column({ type: "uuid", nullable: true })
  interactionOutUUID!: string;

  @Index()
  @Column({ type: "integer", nullable: false })
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureId: number;

  @Index()
  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  usagerUUID: string;

  public constructor(entity?: Partial<InteractionsTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
