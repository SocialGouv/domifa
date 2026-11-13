import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  MinLength,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import {
  DEPARTEMENTS_MAP,
  MON_DOMIFA_CONTACT_SUBJECTS,
  MON_DOMIFA_CONTACT_SUBJECTS_DEF,
  MonDomifaContactSubject,
  REGIONS_LISTE,
} from "@domifa/common";

import {
  LowerCaseTransform,
  StripTagsTransform,
} from "../../_common/decorators";

const emptyToUndefined = ({ value }: TransformFnParams) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

// Contact form of the "Mon DomiFa" portal (domiciliés, not authenticated)
export class MonDomifaContactDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @StripTagsTransform()
  public nom!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @StripTagsTransform()
  public prenom!: string;

  // Required so that the support team can answer
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(254)
  @LowerCaseTransform()
  public email!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9 .()-]{6,25}$/)
  @Transform(emptyToUndefined)
  public phone?: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.keys(REGIONS_LISTE))
  @Transform(emptyToUndefined)
  public regionCode?: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.keys(DEPARTEMENTS_MAP))
  @Transform(emptyToUndefined)
  public departement?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  @StripTagsTransform()
  public structureName!: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(MON_DOMIFA_CONTACT_SUBJECTS)
  public subject!: MonDomifaContactSubject;

  // Required for free-text subjects, optional otherwise
  @ValidateIf(
    (dto: MonDomifaContactDto) =>
      !!MON_DOMIFA_CONTACT_SUBJECTS_DEF[dto.subject]?.requiresMessage ||
      (dto.content !== undefined && dto.content !== null)
  )
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  @StripTagsTransform({ multiline: true })
  public content?: string;
}
