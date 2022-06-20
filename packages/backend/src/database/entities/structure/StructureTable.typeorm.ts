import { Column, Entity, Generated, Index } from "typeorm";
import { TimeZone } from "../../../util/territoires";
import {
  Structure,
  StructurePortailUsagerParams,
  StructureResponsable,
  StructureType,
  Telephone,
} from "../../../_common/model";
import { StructureAddresseCourrier } from "../../../_common/model/structure/StructureAddresseCourrier.type";
import { StructureSmsParams } from "../../../_common/model/structure/StructureSmsParams.type";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "structure" })
export class StructureTable
  extends AppTypeormTable<StructureTable>
  implements Structure
{
  @Index()
  @Column({ type: "integer", unique: true })
  @Generated("increment")
  public id: number;

  @Column({ type: "text", nullable: false })
  public adresse: string;

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

  @Column({ type: "text", nullable: false })
  departement: string;

  @Column({ type: "text", nullable: false })
  region: string;

  @Column({ type: "text", nullable: false })
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

  @Column({ type: "text", nullable: false })
  nom: string;

  @Column({ type: "jsonb", nullable: true })
  options: {
    numeroBoite: boolean;
  };

  // ! DEPRECATED
  @Column({ type: "text", nullable: true })
  phone?: string;

  @Column({
    type: "jsonb",
    nullable: false,
    default: () => `'{"countryCode": "fr", "numero": ""}'`,
  })
  public telephone: Telephone;

  @Column({ type: "jsonb" })
  responsable: StructureResponsable;

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
  sms: StructureSmsParams;

  @Column({ type: "text", nullable: true })
  timeZone: TimeZone;

  @Column({
    type: "jsonb",
    default: () => `'{"enabledByDomifa": true, "enabledByStructure": false}'`,
  })
  portailUsager: StructurePortailUsagerParams;

  public get telephoneString(): string {
    if (this.telephone.numero === "" || this.telephone.numero === null)
      return "";
    return `${this.telephone.countryCode}${this.telephone.numero}`;
  }

  public constructor(entity?: Partial<StructureTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
