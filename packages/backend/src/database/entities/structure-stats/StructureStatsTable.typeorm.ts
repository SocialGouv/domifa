import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import {
  StructureStats,
  StructureStatsQuestionsAtDate,
  StructureType,
} from "../../../_common/model";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure_stats" })
@Unique(["date", "structureId"])
export class StructureStatsTable
  extends AppTypeormTable<StructureStatsTable>
  implements StructureStats {
  @Column({ type: "text" })
  nom: string;

  @Column({ type: "date" })
  date: Date;

  @Index()
  @Column({ type: "integer" })
  structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureFk?: Promise<StructureTable>;

  @Column({ type: "text" })
  structureType: StructureType;

  @Column({ type: "text" })
  departement: string;

  @Column({ type: "text" })
  ville: string;

  @Column({ type: "integer", nullable: true })
  capacite: number;

  @Column({ type: "text" })
  codePostal: string;

  @Column({ type: "jsonb" })
  questions: StructureStatsQuestionsAtDate;

  @Column({ type: "boolean", default: false })
  generated: boolean;
}
