import { StructureOptionsDto } from "./structure-options.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
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
  IsValidPhone,
  Trim,
  TrimOrNullTransform,
} from "../../_common/decorators";
import { ValidationRegexp } from "../../usagers/controllers/import/step2-validate-row";
import {
  StructureType,
  STRUCTURE_TYPE_MAP,
  STRUCTURE_ORGANISME_TYPE_LABELS,
  StructureOrganismeType,
  TimeZone,
  Telephone,
} from "@domifa/common";

export class StructureDto {
  @ApiProperty({
    type: String,
    required: true,
    enum: STRUCTURE_TYPE_MAP,
  })
  @IsNotEmpty()
  @IsIn(STRUCTURE_TYPE_MAP)
  public structureType!: StructureType;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  @Trim()
  public adresse!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @TrimOrNullTransform()
  @MaxLength(400)
  @Trim()
  public nom!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  @TrimOrNullTransform()
  public complementAdresse!: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @Min(0)
  @IsNumber()
  @IsOptional()
  public capacite!: number;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5)
  @Matches(ValidationRegexp.postcode)
  public codePostal!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(100)
  public ville!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsString()
  @TrimOrNullTransform()
  public agrement!: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  public departement!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @Trim()
  public email!: string;

  @ApiProperty({
    type: Object,
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  @IsValidPhone("telephone", true, false)
  public telephone: Telephone;

  @ApiProperty({
    required: true,
    type: Object,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => StructureResponsableDto)
  public responsable!: StructureResponsableDto;

  @ApiProperty({
    required: false,
    type: Object,
  })
  @ValidateNested()
  @Type(() => StructureAdresseCourrierDto)
  @IsNotEmpty()
  public adresseCourrier!: StructureAdresseCourrierDto;

  @ApiProperty({
    type: Object,
    required: true,
  })
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

  @IsBoolean()
  @Equals(true)
  readCgu: boolean;

  @IsBoolean()
  @Equals(true)
  acceptCgu: boolean;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsOptional()
  @IsString()
  @Trim()
  @MaxLength(100)
  public reseau!: string;
}
