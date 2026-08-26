import {
  UsagerSexe,
  COUNTRIES,
  Telephone,
  UsagerAyantDroit,
} from "@domifa/common";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import {
  StripTagsTransform,
  TrimOrNullTransform,
  LowerCaseTransform,
  IsValidPhone,
} from "../../../_common/decorators";
import { UsagerAyantDroitDto } from "../UsagerAyantDroitDto";
import { TelephoneDto } from "../../../_common/dto/telephone.dto";

export class CreateUsagerDto {
  @IsIn(["homme", "femme"])
  @IsNotEmpty()
  public sexe!: UsagerSexe;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @StripTagsTransform()
  public nom: string;

  @IsNotEmpty()
  @MaxLength(200)
  @IsString()
  @StripTagsTransform()
  public prenom!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  @StripTagsTransform()
  public surnom!: string;

  @IsNotEmpty()
  @IsDateString()
  public dateNaissance!: Date;

  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  @StripTagsTransform()
  public villeNaissance!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @StripTagsTransform()
  public langue!: string | null;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(COUNTRIES))
  public nationalite!: string | null;

  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @MaxLength(50)
  public customRef!: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(254)
  @TrimOrNullTransform()
  @LowerCaseTransform()
  public email!: string;

  @IsOptional()
  @IsNumber()
  public referrerId!: number;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TelephoneDto)
  @IsValidPhone("telephone", false, true)
  public telephone!: Telephone;

  @IsNotEmpty()
  @IsBoolean()
  public contactByPhone!: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UsagerAyantDroitDto)
  public ayantsDroits!: UsagerAyantDroit[];

  @IsOptional()
  @MaxLength(50)
  @IsString()
  @StripTagsTransform()
  public numeroDistribution!: string;
}
