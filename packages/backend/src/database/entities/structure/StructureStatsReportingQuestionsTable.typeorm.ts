import {
  StructureWaitingTime,
  StructureStatsReportingQuestions,
} from "@domifa/common";

import { Entity, Column, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { AppTypeormTable } from "../_core";
import { StructureTable } from "./StructureTable.typeorm";

@Entity({ name: "structure_stats_reporting" })
@Unique(["structureId", "year"])
export class StructureStatsReportingQuestionsTable
  extends AppTypeormTable<StructureStatsReportingQuestionsTable>
  implements StructureStatsReportingQuestions
{
  @Column({ nullable: true, type: "boolean" })
  waitingList: boolean;

  @Column({
    type: "text",
    nullable: true,
  })
  waitingTime: StructureWaitingTime | null;

  @Column({ nullable: true, type: "integer" })
  workers: number | null;

  @Column({ nullable: true, type: "integer" })
  volunteers: number | null;

  @Column({ nullable: true, type: "integer" })
  humanCosts: number;

  @Column({ nullable: true, type: "integer" })
  totalCosts: number | null;

  @Index()
  @Column({ type: "integer", nullable: false })
  year: number | null;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "jsonb", nullable: true })
  completedBy: {
    id: number;
    nom: string;
    prenom: string;
  };

  @Column({ type: "timestamptz", nullable: true })
  confirmationDate: Date;

  public constructor(entity?: Partial<StructureStatsReportingQuestionsTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
