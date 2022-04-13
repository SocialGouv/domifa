import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import {
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecisionStatut,
  UsagerHistoryDecisions,
  UsagerTypeDom,
} from "../../../_common/model";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerHistoryTable } from "./UsagerHistoryTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager_history_decision" })
@Unique(["structureId", "usagerRef"])
export class UsagerHistoryDecisionsTable
  extends AppTypeormTable<UsagerHistoryDecisionsTable>
  implements UsagerHistoryDecisions
{
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

  @Column({ type: "date" })
  dateDecision: Date; // Now()

  @Column({ type: "date", nullable: true })
  dateDebut: Date | null;
  @Column({ type: "date", nullable: true })
  dateFin: Date | null;

  @Column({ type: "text", nullable: true })
  typeDom: UsagerTypeDom | null;

  @Column({ type: "text", nullable: true })
  statut: UsagerDecisionStatut;

  // Motif de refus ou radiation
  @Column({ type: "text", nullable: true })
  motif: UsagerDecisionMotif | null;
  @Column({ type: "text", nullable: true })
  motifDetails: string | null;

  // Orientation si refus
  @Column({ type: "text", nullable: true })
  orientation: UsagerDecisionOrientation | null;

  @Column({ type: "text", nullable: true })
  orientationDetails: string | null;

  @Column({ type: "integer", nullable: false })
  userId: number; // UserStructure.id
  @Column({ type: "text", nullable: false })
  userName: string; // UserStructure.nom / prenom

  public constructor(entity?: Partial<UsagerHistoryTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
