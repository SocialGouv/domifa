import { Column, Entity, Index, Unique } from "typeorm";
import {
  StructureStats,
  StructureStatsQuestions,
  StructureType,
} from "../../../_common/model";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure_stats" })
@Unique(["date", "structureId"])
export class StructureStatsTable
  extends AppTypeormTable<StructureStatsTable>
  implements StructureStats {
  @Column({ type: "text", nullable: true })
  _id: any; // obsolete mongo id: use `uuid` instead

  @Column({ type: "text" })
  nom: string;

  @Column({ type: "date" })
  date: Date;

  @Index()
  @Column({ type: "integer" })
  structureId: number;

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
  questions: StructureStatsQuestions;
}
