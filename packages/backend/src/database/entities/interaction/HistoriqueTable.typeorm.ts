import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export interface Historique {
  IDHistorique: number;
  id_domicilié: number;
  texte: string;
  date: Date;
  type: string;
  param: string;
  param2: string;
  utilisateur: string;
  tri: number;
}

@Entity("Historique")
export class HistoriqueTable {
  @PrimaryGeneratedColumn()
  IDHistorique: number;

  @Column()
  id_domicilié: number;

  @Column()
  texte: string;

  @Column()
  date: Date;

  @Column()
  type: string;

  @Column()
  param: string;

  @Column()
  param2: string;

  @Column()
  utilisateur: string;

  @Column()
  tri: number;

  public constructor(entity?: Partial<HistoriqueTable>) {
    Object.assign(this, entity);
  }
}
