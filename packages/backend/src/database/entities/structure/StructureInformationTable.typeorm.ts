import {
  StructureInformation,
  StructureInformationType,
  UserStructureResume,
} from "@domifa/common";
import { Entity, Column, Index, JoinColumn, ManyToOne } from "typeorm";
import { AppTypeormTable } from "../_core";
import { StructureTable } from "./StructureTable.typeorm";

@Entity({ name: "structure_information" })
export class StructureInformationTable
  extends AppTypeormTable<StructureInformationTable>
  implements StructureInformation
{
  @Column({ type: "varchar" })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isTemporary: boolean;

  @Column({ type: "timestamp", nullable: true })
  startDate: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endDate: Date | null;

  @Column({ type: "varchar" })
  type: StructureInformationType;

  @Column({ type: "jsonb", nullable: true })
  createdBy: UserStructureResume;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;
}
