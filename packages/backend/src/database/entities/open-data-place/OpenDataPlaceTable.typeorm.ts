import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { StructureTable } from "../structure";
import { AppTypeormTable } from "../_core";

@Entity("open_data_places")
export class OpenDataPlaceTable extends AppTypeormTable<OpenDataPlaceTable> {
  @Column({ type: "text", nullable: false })
  nom: string;

  @Column({ type: "text", nullable: false })
  adresse: string;

  @Column({ type: "text", nullable: true })
  complementAdresse: string;

  @Column({ type: "text", nullable: true })
  ville: string;

  @Index()
  @Column({ type: "text", nullable: true })
  codePostal: string;

  @Index()
  @Column({ type: "text", nullable: false })
  departement: string;

  @Index()
  @Column({ type: "text", nullable: false })
  region: string;

  @Column("decimal", { precision: 10, scale: 7 })
  latitude: number;

  @Column("decimal", { precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: "text", nullable: false })
  source: "soliguide" | "domifa" | "data-inclusion";

  @Column({ type: "text", nullable: false })
  uniqueId: string; // ID from soliguide | data-inclusion

  @Column({ type: "text", nullable: true })
  software: "domifa" | "millesime" | "other";

  @Index()
  @Column({ type: "integer", nullable: true })
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  structureId: number;

  @Column({ type: "text", nullable: true })
  mail: string;

  public constructor(entity?: Partial<OpenDataPlaceTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
