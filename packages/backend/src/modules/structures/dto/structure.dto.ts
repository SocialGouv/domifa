import { StructureOptionsDto } from "./structure-options.dto";
import { Transform, Type } from "class-transformer";
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsTimeZone,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { StructureAdresseCourrierDto, StructureResponsableDto } from ".";
import {
  IsSIRET,
  IsValidPhone,
  StripTagsTransform,
  Trim,
  TrimOrNullTransform,
} from "../../../_common/decorators";
import { cleanSiret } from "@domifa/common";
import { ValidationRegexp } from "../../../usagers/controllers/import/step2-validate-row";
import {
  StructureType,
  STRUCTURE_TYPE_MAP,
  STRUCTURE_ORGANISME_TYPE_LABELS,
  StructureOrganismeType,
  TimeZone,
  Telephone,
} from "@domifa/common";
import { StructureRegistrationDto } from "./structure-registration-data.dto";

export class StructureDto {
  @IsNotEmpty()
  @IsIn(STRUCTURE_TYPE_MAP)
  public structureType!: StructureType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  @Trim()
  public adresse!: string;

  @IsString()
  @IsNotEmpty()
  @TrimOrNullTransform()
  @MaxLength(400)
  @Trim()
  public nom!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  @TrimOrNullTransform()
  public complementAdresse!: string;

  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  public capacite!: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5)
  @Matches(ValidationRegexp.postcode)
  public codePostal!: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(100)
  public ville!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @TrimOrNullTransform()
  public agrement!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  public departement!: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(254)
  @Trim()
  public email!: string;

  @IsNotEmpty()
  @IsObject()
  @IsValidPhone("telephone", true, false)
  public telephone: Telephone;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => StructureResponsableDto)
  public responsable!: StructureResponsableDto;

  @ValidateNested()
  @Type(() => StructureAdresseCourrierDto)
  @IsNotEmpty()
  public adresseCourrier!: StructureAdresseCourrierDto;

  @ValidateNested()
  @Type(() => StructureOptionsDto)
  @IsNotEmpty()
  public options!: StructureOptionsDto;

  @IsEmpty()
  public region!: string;

  @IsEmpty()
  public regionName!: string;

  @IsEmpty()
  public departmentName!: string;

  @IsOptional()
  @IsTimeZone()
  public timeZone: TimeZone;

  @ValidateIf((o) => {
    return o.structureType === "asso";
  })
  @IsIn(Object.keys(STRUCTURE_ORGANISME_TYPE_LABELS))
  @IsNotEmpty()
  public organismeType: StructureOrganismeType;

  @ValidateIf((o) => o.structureType === "asso" && o.organismeType === "AUTRE")
  @StripTagsTransform()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public organismeTypeDetail?: string | null;

  @IsBoolean()
  @Equals(true)
  acceptCgu: boolean;

  @ValidateIf((o) => o.structureType === "asso")
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(100)
  public reseau!: string;

  @ValidateIf((o) => o.structureType === "asso" && o.reseau === "Autre réseau")
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(100)
  public reseauDetail?: string | null;

  @Transform(({ value }) => cleanSiret(value))
  @ValidateIf((o) => o.noSiret !== true)
  @IsString()
  @IsSIRET()
  siret: string | null;

  @IsOptional()
  @IsBoolean()
  noSiret: boolean | null;

  @ValidateNested()
  @Type(() => StructureRegistrationDto)
  registrationData: StructureRegistrationDto;
}
