import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";

export interface TmpCourriers {
  IDDomicilie: number;
  motif: number;
  date: number;
  Date_recup: number;
}

@Entity("TmpCourriers")
export class TmpCourriersTable {
  @PrimaryGeneratedColumn("uuid")
  public uuid?: string;

  @Index()
  @Column({ type: "integer", nullable: true })
  IDDomicilie: number;

  @Column({ type: "integer", nullable: true })
  date: number;

  @Column({ type: "integer", nullable: true })
  Date_recup: number;

  @Column({ type: "integer", nullable: true })
  motif: number;

  public constructor(entity?: Partial<TmpCourriersTable>) {
    Object.assign(this, entity);
  }
}
