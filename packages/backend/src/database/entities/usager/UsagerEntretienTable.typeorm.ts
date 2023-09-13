import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Unique,
} from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { StructureTable } from "../structure";
import { UsagerTable } from "./UsagerTable.typeorm";

import { UsagerNotesTable } from "./UsagerNotesTable.typeorm";
import {
  UsagerEntretienTypeMenage,
  UsagerEntretienLienCommune,
  UsagerEntretienResidence,
  UsagerEntretienCause,
  UsagerEntretienRaisonDemande,
  UsagerEntretien,
} from "@domifa/common";

@Unique(["structureId", "usagerRef"])
@Entity({ name: "usager_entretien" })
export class UsagerEntretienTable
  extends AppTypeormTable<UsagerEntretienTable>
  implements UsagerEntretien
{
  @Index()
  @Column({ type: "uuid", nullable: false, unique: true })
  @OneToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "usagerUUID",
    referencedColumnName: "uuid",
  })
  public usagerUUID: string;

  @Index()
  @Column({ type: "integer", nullable: false })
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "integer", update: false, nullable: false })
  public usagerRef: number;

  @Column({ type: "boolean", nullable: true })
  public domiciliation: boolean;

  @Column({ type: "text", nullable: true })
  public commentaires: string;

  @Column({ type: "text", nullable: true })
  public typeMenage: UsagerEntretienTypeMenage;

  @Column({ type: "boolean", nullable: true })
  public revenus: boolean;

  @Column({ type: "text", nullable: true })
  public revenusDetail: string;

  @Column({ type: "boolean", nullable: true })
  public orientation: boolean;

  @Column({ type: "text", nullable: true })
  public orientationDetail: string;

  @Column({ type: "text", nullable: true })
  public liencommune: UsagerEntretienLienCommune;

  @Column({ type: "text", nullable: true })
  public liencommuneDetail: string;

  @Column({ type: "text", nullable: true })
  public residence: UsagerEntretienResidence;

  @Column({ type: "text", nullable: true })
  public residenceDetail: string;

  @Column({ type: "text", nullable: true })
  public cause: UsagerEntretienCause;

  @Column({ type: "text", nullable: true })
  public causeDetail: string;

  @Column({ type: "text", nullable: true })
  public rattachement: string;

  @Column({ type: "text", nullable: true })
  public raison: UsagerEntretienRaisonDemande;

  @Column({ type: "text", nullable: true })
  public raisonDetail: string;

  @Column({ type: "boolean", nullable: true })
  public accompagnement: boolean;

  @Column({ type: "text", nullable: true })
  public accompagnementDetail: string;

  public constructor(entity: Partial<UsagerNotesTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
