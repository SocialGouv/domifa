import { Entity, Column } from "typeorm";
import { AppTypeormTable } from "../_core";

@Entity("open_data_cities")
export class OpenDataCitiesTable extends AppTypeormTable<OpenDataCitiesTable> {
  @Column({ type: "text", nullable: true })
  regionCode: string;

  @Column({ type: "text", nullable: true })
  region: string;

  @Column({ type: "text", nullable: true })
  departmentCode: string;

  @Column({ type: "text", nullable: true })
  department: string;

  @Column({ type: "text", nullable: false })
  city: string;

  @Column({ type: "text", nullable: false })
  cityCode: string;

  @Column({ type: "text", nullable: true })
  postalCode: string;

  @Column({ type: "int", nullable: true, default: 0 })
  population: number;

  @Column({ type: "jsonb", nullable: true })
  areas: {
    type: string;
    coordinates: number[][][];
  };

  public constructor(entity?: Partial<OpenDataCitiesTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
