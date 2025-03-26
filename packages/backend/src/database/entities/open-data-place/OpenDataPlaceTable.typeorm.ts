import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { StructureTable } from "../structure";
import { AppTypeormTable } from "../_core";
import { StructureType } from "@domifa/common";
import {
  OpenDataSource,
  Saturation,
} from "../../../modules/open-data-places/interfaces";

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
  source: OpenDataSource;

  @Column({ type: "text", nullable: true })
  software: "domifa" | "millesime" | "other" | "mss";

  @Index()
  @Column({ type: "integer", nullable: true })
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "domifaStructureId", referencedColumnName: "id" })
  domifaStructureId: number;

  @Column({ type: "integer", nullable: true })
  soliguideStructureId: number;

  @Column({ type: "text", nullable: true })
  mssId: string;

  @Column({ type: "text", nullable: true })
  dgcsId: string;

  @Column({ type: "text", nullable: true })
  mail: string;

  @Column({ type: "text", nullable: true })
  structureType: StructureType;

  @Column({ type: "integer", nullable: true })
  nbDomicilies?: number | null;

  @Column({ type: "integer", nullable: true })
  nbAttestations?: number | null;

  @Column({ type: "integer", nullable: true })
  nbAttestationsDomifa?: number | null;

  @Column({ type: "integer", nullable: true })
  nbDomiciliesDomifa?: number | null;

  @Column({ type: "text", nullable: true })
  saturation?: Saturation;

  @Column({ type: "text", nullable: true })
  saturationDetails?: string | null;

  @Column({ type: "text", nullable: true })
  reseau?: string | null;

  public constructor(entity?: Partial<OpenDataPlaceTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
