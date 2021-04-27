import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import {
  UsagerAyantDroit,
  UsagerDecision,
  UsagerEntretien,
  UsagerHistory,
  UsagerHistoryAttribute,
} from "../../../_common/model";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager_history" })
@Unique(["structureId", "usagerRef"])
export class UsagerHistoryTable
  extends AppTypeormTable<UsagerHistoryTable>
  implements UsagerHistory {
  @Index()
  @Column({ type: "text", unique: true, update: false }) // unique par structure
  public usagerUUID: string;

  @ManyToOne(() => UsagerTable, { lazy: true })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  usagerFk?: Promise<UsagerTable>;

  @Column({ type: "integer", update: false })
  public usagerRef: number;

  @Index()
  @Column({ type: "integer", update: false })
  structureId: number;

  @ManyToOne(() => StructureTable, { lazy: true })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureFk?: Promise<StructureTable>;

  // ces objets sont stockées au moment de leur créations, jamais modifiés par la suite (on stocke une nouvelle version)

  @Column({ type: "jsonb" })
  decisions: UsagerHistoryAttribute<UsagerDecision>[];

  @Column({ type: "jsonb" })
  ayantsDroits: UsagerHistoryAttribute<UsagerAyantDroit[]>[];

  @Column({ type: "jsonb" })
  entretiens: UsagerHistoryAttribute<UsagerEntretien>[];
}
