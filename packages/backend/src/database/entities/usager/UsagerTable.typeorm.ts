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
import { Usager, UsagerOptions, Telephone } from "../../../_common/model";

import { UsagerNote } from "../../../_common/model/usager/UsagerNote.type";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerImport } from "./../../../_common/model/usager/UsagerImport.type";
import { UsagerNotesTable } from "./UsagerNotesTable.typeorm";
import {
  UsagerEntretien,
  UsagerRdv,
  UsagerSexe,
  UsagerLastInteraction,
  UsagerTypeDom,
  UsagerAyantDroit,
  UsagerDecision,
} from "@domifa/common";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager" })
@Unique(["structureId", "ref"])
@Index("idx_usagers", ["structureId", "ref"])
@Index("idx_structure_statut", ["structureId", "decision"])
@Index("idx_decision_gin", { synchronize: false })
export class UsagerTable
  extends AppTypeormTable<UsagerTable>
  implements Usager
{
  @Index()
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

  @Column({ type: "text", nullable: false })
  public nom!: string;

  @Column({ type: "text", nullable: false })
  public prenom!: string;

  @Column({ type: "text", nullable: true })
  public surnom!: string;

  @Index()
  @Column({ type: "text", nullable: false })
  public sexe!: UsagerSexe;

  @Index()
  @Column({ type: "timestamptz", nullable: false })
  public dateNaissance!: Date;

  @Column({ type: "text" })
  public villeNaissance!: string;

  @Column({ type: "text", nullable: true })
  public langue!: string | null;

  @Column({ type: "text", nullable: true })
  public email!: string | null;

  @Column({
    type: "jsonb",
    nullable: false,
    default: '{"countryCode":"fr", "numero":""}',
  })
  public telephone: Telephone;

  @Column({ type: "boolean", nullable: true, default: false })
  public contactByPhone!: boolean;

  @Column({ type: "timestamptz", nullable: true })
  public datePremiereDom!: Date | null;

  @Index()
  @Column({ type: "text", nullable: true, default: "PREMIERE_DOM" })
  public typeDom!: UsagerTypeDom;

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

  @Column({ type: "jsonb", nullable: true })
  public rdv!: UsagerRdv | null;

  @OneToMany(() => UsagerNotesTable, (note: UsagerNote) => note.usagerUUID)
  public notes!: UsagerNote[];

  @OneToOne(
    () => UsagerEntretienTable,
    (entretien: UsagerEntretien) => entretien.usagerUUID
  )
  public entretien!: UsagerEntretien;

  //
  // TRANSFERTS / NPAI / PROCURATION
  @Column({
    type: "jsonb",
    default:
      '{"transfert":{"actif":false,"nom":null,"adresse":null,"dateDebut":null,"dateFin":null},"procurations":[],"npai":{"actif":false,"dateDebut":null},"portailUsagerEnabled":false}',
  })
  public options!: UsagerOptions;

  @Index()
  @Column({ type: "boolean", default: false })
  public migrated!: boolean;

  @Column({ type: "text", default: null })
  public numeroDistribution!: string | null;

  @Column({ type: "jsonb", default: null, nullable: true })
  public pinnedNote!: Partial<UsagerNote> | null;

  public constructor(entity?: Partial<UsagerTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
