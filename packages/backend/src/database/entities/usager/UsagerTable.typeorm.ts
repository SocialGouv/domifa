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
import {
  Usager,
  UsagerLastInteractions,
  UsagerOptions,
  UsagerRdv,
  UsagerSexe,
  UsagerTypeDom,
  Telephone,
} from "../../../_common/model";
import { UsagerEntretien } from "../../../_common/model/usager/entretien";
import { UsagerAyantDroit } from "../../../_common/model/usager/UsagerAyantDroit.type";
import { UsagerDecision } from "../../../_common/model/usager/UsagerDecision.type";
import { UsagerNote } from "../../../_common/model/usager/UsagerNote.type";
import { StructureTable } from "../structure/StructureTable.typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerImport } from "./../../../_common/model/usager/UsagerImport.type";
import { UsagerNotesTable } from "./UsagerNotesTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "usager" })
@Unique(["structureId", "ref"])
export class UsagerTable
  extends AppTypeormTable<UsagerTable>
  implements Usager
{
  @Index()
  @Column({ type: "integer" }) // unique par structure
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
    default: () => `'{"countryCode": "fr", "numero": ""}'`,
  })
  public telephone!: Telephone;

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
    // default:
    //   "{ dateInteraction: now(), enAttente: false, courrierIn: 0, recommandeIn: 0, colisIn: 0};",
  })
  public lastInteraction!: UsagerLastInteractions;

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

  @Column({
    type: "jsonb",
    nullable: true,
  })
  public oldEntretien!: UsagerEntretien;

  //
  // TRANSFERTS / NPAI / PROCURATION
  @Column({
    type: "jsonb",
    default: () => `''`,
  })
  public options!: UsagerOptions;

  @Index()
  @Column({ type: "boolean", default: false })
  public migrated!: boolean;

  @Column({ type: "text", default: null })
  public numeroDistribution!: string | null;

  public constructor(entity?: Partial<UsagerTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
