import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { StructureTable } from "../structure";
import { UsagerTable } from "./UsagerTable.typeorm";
import { UsagerNote } from "../../../_common/model";
import { UserStructureResume } from "@domifa/common";
// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager_notes" })
export class UsagerNotesTable
  extends AppTypeormTable<UsagerNotesTable>
  implements UsagerNote
{
  @Index()
  @Column({ type: "integer", unique: true })
  @Generated("increment")
  public id: number;

  @Index()
  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Index()
  @Column({ type: "integer", nullable: false })
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "integer", update: false, nullable: false })
  public usagerRef: number;

  @Column({ type: "text", nullable: false })
  public message: string;

  @Column({ type: "boolean", nullable: false, default: false })
  public archived: boolean;

  @Column({ type: "boolean", nullable: false, default: false })
  public pinned: boolean;

  @Column({ type: "jsonb", nullable: true })
  public createdBy: UserStructureResume;

  @Column({ type: "jsonb", nullable: true })
  public archivedBy: UserStructureResume;

  @Column({ type: "date", nullable: true })
  public archivedAt: Date;

  public constructor(entity?: Partial<UsagerNotesTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
