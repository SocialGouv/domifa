import {
  UsagerSexe,
  COUNTRIES,
  Telephone,
  UsagerAyantDroit,
} from "@domifa/common";
import { Type } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsEmail,
  IsObject,
  IsBoolean,
  IsArray,
  ValidateIf,
  ValidateNested,
  IsNumber,
} from "class-validator";
import {
  Trim,
  StripTagsTransform,
  TrimOrNullTransform,
  LowerCaseTransform,
  IsValidPhone,
} from "../../../_common/decorators";
import { UsagerAyantDroitDto } from "../UsagerAyantDroitDto";

export class CreateUsagerDto {
  @IsIn(["homme", "femme"])
  @IsNotEmpty()
  public sexe!: UsagerSexe;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Trim()
  @StripTagsTransform()
  public nom: string;

  @IsNotEmpty()
  @MaxLength(200)
  @IsString()
  @Trim()
  @StripTagsTransform()
  public prenom!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  @StripTagsTransform()
  @TrimOrNullTransform()
  public surnom!: string;

  @IsNotEmpty()
  @IsDateString()
  public dateNaissance!: Date;

  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  @StripTagsTransform()
  @Trim()
  public villeNaissance!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @TrimOrNullTransform()
  @StripTagsTransform()
  public langue!: string | null;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(COUNTRIES))
  public nationalite!: string | null;

  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @TrimOrNullTransform()
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
  @IsValidPhone("telephone", false, true)
  public telephone!: Telephone;

  @IsNotEmpty()
  @IsBoolean()
  public contactByPhone!: boolean;

  @IsOptional()
  @IsArray()
  @ValidateIf((o) => {
    return o?.ayantsDroits?.length > 0;
  })
  @ValidateNested({ each: true })
  @Type(() => UsagerAyantDroitDto)
  public ayantsDroits!: UsagerAyantDroit[];

  @IsOptional()
  @MaxLength(50)
  @IsString()
  @StripTagsTransform()
  @TrimOrNullTransform()
  public numeroDistribution!: string;
}
