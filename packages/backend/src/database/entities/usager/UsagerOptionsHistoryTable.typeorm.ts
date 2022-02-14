import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { UsagerTable } from "./UsagerTable.typeorm";
import {
  UsagerOptionsHistory,
  UsagerOptionsHistoryAction,
  UsagerOptionsHistoryType,
} from "../../../_common/model";

@Entity({ name: "usager_options_history" })
export class UsagerOptionsHistoryTable
  extends AppTypeormTable<UsagerOptionsHistoryTable>
  implements UsagerOptionsHistory
{
  @ManyToOne(() => UsagerTable, { lazy: true })
  @JoinColumn({ name: "usagerUUID", referencedColumnName: "uuid" })
  usager: Promise<UsagerTable>;

  @Column({ type: "text" })
  public userId: string;

  @Column({ type: "integer" })
  public structureId: number;

  @Column({ type: "text", nullable: false })
  public action: UsagerOptionsHistoryAction;

  @Column({ type: "text", nullable: false })
  public type: UsagerOptionsHistoryType;

  @Column({ type: "date", nullable: false })
  public date: Date;

  @Column({ type: "text" })
  public nom: string;

  @Column({ type: "text" })
  public prenom: string;

  @Column({ type: "text" })
  public adresse: string;

  @Column({ type: "bool", default: false, nullable: false })
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
