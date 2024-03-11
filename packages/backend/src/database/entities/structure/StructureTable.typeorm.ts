import { BeforeInsert, Column, Entity, Generated, Index } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import {
  StructureAddresseCourrier,
  StructureSmsParams,
  StructurePortailUsagerParams,
  StructureResponsable,
  StructureType,
  Structure,
  Telephone,
  StructureOrganismeType,
  TimeZone,
} from "@domifa/common";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure" })
export class StructureTable
  extends AppTypeormTable<StructureTable>
  implements Structure
{
  @Index()
  @Column({ type: "integer", unique: true })
  @Generated("increment")
  id: number;

  @Column({ type: "text", nullable: false })
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

  @Index()
  @Column({ type: "text", nullable: true })
  codePostal: string;

  @Column({ type: "text", nullable: true })
  complementAdresse: string;

  @Index()
  @Column({ type: "text", nullable: false })
  departement: string;

  @Index()
  @Column({ type: "text", nullable: false })
  region: string;

  @Index()
  @Column({ type: "text", nullable: true })
  departmentName: string;

  @Index()
  @Column({ type: "text", nullable: true })
  regionName: string;

  @Index()
  @Column({ type: "text", nullable: false, unique: true })
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

  @Column({ type: "bool", default: false })
  filesUpdated: boolean;

  @Column({ type: "timestamptz", nullable: false })
  registrationDate: Date;

  @Column({ type: "date", nullable: true })
  importDate: Date;

  @Column({ type: "date", nullable: true })
  lastLogin: Date;

  @Column({ type: "text", nullable: false })
  nom: string;

  @Column({
    type: "jsonb",
    default: () => `'{"numeroBoite": true, "surnom": false}'`,
  })
  options: {
    numeroBoite: boolean;
    surnom: boolean;
  };

  @Column({
    type: "jsonb",
    nullable: false,
    default: () => `'{"countryCode": "fr", "numero": ""}'`,
  })
  public telephone: Telephone;

  @Column({ type: "jsonb" })
  responsable: StructureResponsable;

  @Index()
  @Column({ type: "text", nullable: false })
  structureType: StructureType;

  @Column({ type: "text", nullable: true })
  token: string;

  @Column({ type: "bool", default: false })
  verified: boolean;

  @Column({ type: "text", nullable: true })
  ville: string;

  @Column({
    type: "jsonb",
    default: () =>
      `'{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`,
  })
  public sms: StructureSmsParams;

  @Column({ type: "text", nullable: true })
  timeZone: TimeZone;

  @Column({
    type: "jsonb",
    default: () =>
      `'{"enabledByDomifa": true, "enabledByStructure": false, "usagerLoginUpdateLastInteraction": false}'`,
  })
  portailUsager: StructurePortailUsagerParams;

  @Column({ type: "timestamptz", nullable: true })
  acceptTerms: Date;

  @Column({ type: "float", nullable: true })
  latitude: number;

  @Column({ type: "float", nullable: true })
  longitude: number;

  @Column({ type: "text", nullable: true })
  organismeType: StructureOrganismeType;

  @BeforeInsert()
  nameToUpperCase() {
    this.email = this.email.toLowerCase().trim();
  }

  public constructor(entity?: Partial<StructureTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
