import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import {
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecisionStatut,
  UsagerDecision,
  UsagerTypeDom,
} from "../../../_common/model";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerHistoryTable } from "./UsagerHistoryTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager_decision" })
@Unique(["structureId", "usagerRef"])
export class UsagerDecisionTable
  extends AppTypeormTable<UsagerDecisionTable>
  implements UsagerDecision
{
  @Index()
  @Column({ type: "text", update: false }) // unique par structure
  public usagerUUID: string;

  @ManyToOne(() => UsagerTable, { lazy: true })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  usagerFk?: Promise<UsagerTable>;

  @Column({ type: "integer", update: false })
  public usagerRef: number;

  @Index()
  @Column({ type: "integer", update: false })
  public structureId: number;

  @Column({ type: "date" })
  public dateDecision: Date; // Now()

  @Column({ type: "date", nullable: true })
  public dateDebut: Date | null;

  @Column({ type: "date", nullable: true })
  public dateFin: Date | null;

  @Column({ type: "text", nullable: true })
  public typeDom: UsagerTypeDom | null;

  @Column({ type: "text", nullable: true })
  public statut: UsagerDecisionStatut;

  // Motif de refus ou radiation
  @Column({ type: "text", nullable: true })
  public motif: UsagerDecisionMotif | null;

  @Column({ type: "text", nullable: true })
  public motifDetails: string | null;

  // Orientation si refus
  @Column({ type: "text", nullable: true })
  public orientation: UsagerDecisionOrientation | null;

  @Column({ type: "text", nullable: true })
  public orientationDetails: string | null;

  @Column({ type: "integer", nullable: false })
  public userId: number; // UserStructure.id

  @Column({ type: "text", nullable: false })
  public userName: string; // UserStructure.nom / prenom

  public constructor(entity?: Partial<UsagerHistoryTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
