import { Column, Entity, ManyToOne, JoinColumn, Index } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";
import {
  UsagerOptionsHistory,
  UsagerOptionsHistoryAction,
  UsagerOptionsHistoryType,
} from "@domifa/common";
import { StructureTable } from "../structure";

@Entity({ name: "usager_options_history" })
export class UsagerOptionsHistoryTable
  extends AppTypeormTable<UsagerOptionsHistoryTable>
  implements UsagerOptionsHistory
{
  @Index()
  @Column({ type: "uuid", nullable: false })
  @ManyToOne(() => UsagerTable, (usager) => usager.uuid, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  public usagerUUID: string;

  @Index()
  @Column({ type: "integer", nullable: true })
  public userId: number;

  @Column({ type: "text", nullable: true })
  public userName: string;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "text" })
  public action: UsagerOptionsHistoryAction;

  @Column({ type: "text" })
  public type: UsagerOptionsHistoryType;

  @Column({ type: "text", nullable: true })
  public nom: string;

  @Column({ type: "text", nullable: true })
  public prenom: string;

  @Column({ type: "text", nullable: true })
  public adresse: string;

  @Column({ type: "boolean", default: false })
  public actif: boolean;

  @Column({ type: "date", nullable: true })
  public dateDebut: Date;

  @Column({ type: "date", nullable: true })
  public dateFin: Date;

  @Column({ type: "date", nullable: true })
  public dateNaissance: Date;

  public constructor(entity?: Partial<UsagerOptionsHistoryTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
