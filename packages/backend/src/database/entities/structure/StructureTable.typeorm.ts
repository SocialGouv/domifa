import { Column, Entity, Generated, Index } from "typeorm";

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
  PopulationSegmentEnum,
  DomiciliesSegmentEnum,
  StructureRegistrationData,
  StructureOptions,
  StructureDecisionStatut,
} from "@domifa/common";
import { StructureDecision } from "@domifa/common/dist/structure/interfaces/StructureDecision.interface";

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

  @Column({ type: "text", nullable: false })
  codePostal: string;

  @Column({ type: "text", nullable: true })
  cityCode: string; // INSEE code

  @Column({ type: "text", nullable: true })
  complementAdresse: string;

  @Index()
  @Column({ type: "text", nullable: false })
  departement: string;

  @Index()
  @Column({ type: "text", nullable: false })
  region: string;

  @Column({ type: "text", nullable: true })
  departmentName: string;

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

  @Column({
    type: "jsonb",
  })
  options: StructureOptions;

  @Column({
    type: "jsonb",
    nullable: false,
  })
  public telephone: Telephone;

  @Column({ type: "jsonb" })
  responsable: StructureResponsable;

  @Index()
  @Column({ type: "text", nullable: false })
  structureType: StructureType;

  @Column({ type: "text", nullable: false })
  ville: string;

  @Column({
    type: "jsonb",
    default: () =>
      `'{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false, "schedule" :{ "monday": false "tuesday": true "wednesday": false "thursday": true "friday": false } }'`,
  })
  public sms: StructureSmsParams;

  @Column({ type: "text", nullable: false })
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

  @Column({ type: "text", nullable: true })
  reseau: string;

  @Column({ type: "text", nullable: true })
  siret: string;

  @Column({ type: "text", nullable: true })
  domicilieSegment: DomiciliesSegmentEnum | null;

  @Column({ type: "text", nullable: true })
  populationSegment: PopulationSegmentEnum | null;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  registrationData: StructureRegistrationData;

  @Column({ type: "text", default: "EN_ATTENTE" })
  statut: StructureDecisionStatut;

  @Column({ type: "jsonb", nullable: false })
  decision?: StructureDecision;

  public constructor(entity?: Partial<StructureTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
