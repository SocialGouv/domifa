import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import {
  UsagerHistoryStateCreationEvent,
  UsagerHistoryStates,
} from "../../../_common/model";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";
import { UsagerRdv } from "@domifa/common/dist/usager/interfaces/UsagerRdv.interface";
import {
  UsagerAyantDroit,
  UsagerDecision,
  UsagerEntretien,
  UsagerSexe,
  UsagerTypeDom,
} from "@domifa/common";

@Entity({ name: "usager_history_states" })
@Index("idx_stats_range", ["historyBeginDate", "historyEndDate", "isActive"])
export class UsagerHistoryStatesTable
  extends AppTypeormTable<UsagerHistoryStatesTable>
  implements UsagerHistoryStates
{
  @Index()
  @Column({ type: "uuid", update: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureId: number;

  @Column({ type: "jsonb", nullable: false })
  ayantsDroits: Partial<UsagerAyantDroit>[];

  @Column({ type: "jsonb", nullable: false })
  decision: Partial<UsagerDecision>;

  @Column({ type: "text", nullable: true })
  sexe: UsagerSexe;

  @Column({ type: "text", nullable: true })
  nationalite: string;

  @Column({ type: "timestamptz", nullable: true })
  dateNaissance: Date;

  @Column({ type: "jsonb", nullable: false })
  entretien: Partial<UsagerEntretien>;

  @Column({ type: "jsonb", nullable: true })
  rdv: Partial<UsagerRdv>;

  @Column({ type: "text", nullable: false })
  createdEvent: UsagerHistoryStateCreationEvent;

  @Index()
  @Column({ type: "timestamptz", nullable: false })
  historyBeginDate: Date; // début de la période historisée, correspond à l'attribut "historyEndDate" du UsagerHistoryState précédent si il existe (sans rapport avec decision.dateDebut)
  @Index()
  @Column({ type: "timestamptz", nullable: true })
  historyEndDate?: Date; // fin de la période historisée, correspond à l'attribut "historyBeginDate" du UsagerHistoryState suivant

  @Column({ type: "boolean", nullable: true, default: false })
  isActive: boolean; // usager actif si VALIDE ou en cours de renouvellement

  @Column({ type: "text", nullable: true, default: "PREMIERE_DOM" })
  typeDom!: UsagerTypeDom;

  public constructor(entity?: Partial<UsagerHistoryStatesTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
