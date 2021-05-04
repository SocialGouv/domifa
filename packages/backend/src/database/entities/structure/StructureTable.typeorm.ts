import { Column, Entity, Generated, Index } from "typeorm";
import {
  Structure,
  StructureResponsable,
  StructureType,
} from "../../../_common/model";
import { StructureAddresseCourrier } from "../../../_common/model/structure/StructureAddresseCourrier.type";
import { StructureSmsParams } from "../../../_common/model/structure/StructureSmsParams.type";
import { StructureUsagersStats } from "../../../_common/model/structure/StructureUsagersStats.type";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure" })
export class StructureTable
  extends AppTypeormTable<StructureTable>
  implements Structure {
  @Index()
  @Column({ type: "integer", unique: true })
  @Generated("increment")
  id: number;

  @Column({ type: "text", nullable: true })
  adresse: string;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  adresseCourrier: StructureAddresseCourrier;

  @Column({ type: "text", nullable: true })
  agrement: string;

  @Column({ type: "integer", nullable: true })
  capacite: number;

  @Column({ type: "text", nullable: true })
  codePostal: string;

  @Column({ type: "text", nullable: true })
  complementAdresse: string;

  @Column({ type: "text", nullable: true })
  departement: string;

  @Column({ type: "text", nullable: true })
  region: string;

  @Column({ type: "text", nullable: true })
  email: string;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  hardReset: {
    token: string;
    expireAt?: Date;
  };

  @Column({ type: "text", nullable: true })
  tokenDelete: string;

  @Column({ type: "bool", default: false })
  import: boolean;

  @Column({ type: "timestamptz", nullable: false })
  registrationDate: Date;

  @Column({ type: "date", nullable: true })
  importDate: Date;

  @Column({ type: "date", nullable: true })
  lastLogin: Date;

  @Column({ type: "text", nullable: true })
  nom: string;

  @Column({ type: "jsonb", nullable: true })
  options: {
    numeroBoite: boolean;
  };

  @Column({ type: "text", nullable: true })
  phone: string;

  @Column({ type: "jsonb" })
  responsable: StructureResponsable;

  @Column({ type: "jsonb" })
  stats: StructureUsagersStats;

  @Column({ type: "text" })
  structureType: StructureType;

  @Column({ type: "text", nullable: true })
  token: string;

  @Column({ type: "bool", default: false })
  verified: boolean;

  @Column({ type: "text", nullable: true })
  ville: string;

  @Column({
    type: "jsonb",
    default: `{ "enabledByDomifa": false, "enabledByStructure": false, "senderName": null, "senderDetails": null }`,
  })
  sms: StructureSmsParams;
}
