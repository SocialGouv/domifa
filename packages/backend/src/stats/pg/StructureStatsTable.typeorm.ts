import { Column, Entity, Unique } from "typeorm";
import { AppTypeormTable } from "../../database/AppTypeormTable.typeorm";
import { StructureType } from "../../structures/StructureType.type";
import { StructureStats, StructureStatsQuestions } from "../model";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure_stats" })
@Unique(["date", "structureId"])
export class StructureStatsTable
  extends AppTypeormTable<StructureStats>
  implements StructureStats {
  @Column({ type: "text", nullable: true })
  _id: any; // obsolete mongo id: use `uuid` instead

  @Column({ type: "text" })
  nom: string;

  @Column({ type: "date" })
  date: Date;

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
