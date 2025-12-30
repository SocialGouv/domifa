import { UsagerEntretienTable } from "./UsagerEntretienTable.typeorm";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from "typeorm";

import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerNotesTable } from "./UsagerNotesTable.typeorm";
import {
  UsagerEntretien,
  UsagerRdv,
  UsagerSexe,
  UsagerLastInteraction,
  UsagerTypeDom,
  UsagerAyantDroit,
  UsagerDecision,
  UsagerOptions,
  Telephone,
  UsagerNote,
  Usager,
  UsagerDecisionStatut,
  UsagerImport,
} from "@domifa/common";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager" })
@Unique(["structureId", "ref"])
@Index("idx_usager_statut", ["structureId", "statut"])
export class UsagerTable
  extends AppTypeormTable<UsagerTable>
  implements Usager
{
  @Column({ type: "integer" })
  public ref!: number;

  @Column({ type: "text", nullable: true })
  public customRef!: string;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId!: number;

  @Index()
  @Column({
    nullable: false,
    select: false,
  })
  public nom_prenom_surnom_ref: string;

  @Column({ type: "text", nullable: false })
  public nom!: string;

  @Column({ type: "text", nullable: false })
  public prenom!: string;

  @Column({ type: "text", nullable: true })
  public surnom!: string;

  @Column({ type: "text", nullable: false })
  public sexe!: UsagerSexe;

  @Column({ type: "timestamptz", nullable: false })
  public dateNaissance!: Date;

  @Column({ type: "text" })
  public villeNaissance!: string;

  @Column({ type: "text", nullable: true })
  public langue!: string | null;

  @Column({ type: "text", nullable: true })
  public nationalite!: string | null;

  @Column({ type: "text", nullable: true })
  public email!: string | null;

  @Column({
    type: "jsonb",
    nullable: false,
  })
  public telephone: Telephone;

  @Column({ type: "boolean", nullable: true, default: false })
  public contactByPhone!: boolean;

  @Column({ type: "timestamptz", nullable: true })
  public datePremiereDom!: Date | null;

  @Column({ type: "text", nullable: false, default: "PREMIERE_DOM" })
  public typeDom!: UsagerTypeDom;

  @Column({ type: "text", nullable: false, default: "INSTRUCTION" })
  public statut!: UsagerDecisionStatut;

  @Column({ type: "jsonb", nullable: true, default: null })
  public import!: UsagerImport;

  @Column({ type: "jsonb" })
  public decision!: UsagerDecision;

  @Column({ type: "jsonb" })
  public historique!: UsagerDecision[];

  @Column({ type: "jsonb", nullable: true })
  public ayantsDroits!: UsagerAyantDroit[];

  @Column({
    type: "jsonb",
  })
  public lastInteraction!: UsagerLastInteraction;

  @Column({ type: "integer", default: 0 })
  public etapeDemande!: number;

  @Column({ type: "integer", default: null, nullable: true })
  public referrerId!: number;

  @Column({ type: "jsonb", nullable: true })
  public rdv!: UsagerRdv | null;

  @OneToMany(() => UsagerNotesTable, (note: UsagerNote) => note.usagerUUID)
  public notes!: UsagerNote[];

  @OneToOne(
    () => UsagerEntretienTable,
    (entretien: UsagerEntretien) => entretien.usagerUUID
  )
  public entretien!: UsagerEntretien;

  @Column({
    type: "jsonb",
  })
  public options!: UsagerOptions;

  @Index()
  @Column({ type: "boolean", default: false })
  public migrated!: boolean;

  @Column({ type: "text", default: null })
  public numeroDistribution!: string | null;

  @Column({ type: "jsonb", default: null, nullable: true })
  public pinnedNote!: Pick<
    UsagerNote,
    "usagerRef" | "createdAt" | "createdBy" | "message"
  > | null;

  public constructor(entity?: Partial<UsagerTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
