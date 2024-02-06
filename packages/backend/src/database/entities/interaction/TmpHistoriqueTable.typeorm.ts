import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";

export interface TmpHistorique {
  id_domicilie: number;
  date: string;
  type: string;
}

@Entity("TmpHistorique")
export class TmpHistoriqueTable {
  @PrimaryGeneratedColumn("uuid")
  public uuid?: string;

  @Index()
  @Column({ type: "integer", nullable: true })
  id_domicilie: number;

  @Column({ type: "integer", nullable: true })
  date: number;

  @Index()
  @Column({ nullable: true })
  type: string;

  public constructor(entity?: Partial<TmpHistoriqueTable>) {
    Object.assign(this, entity);
  }
}
