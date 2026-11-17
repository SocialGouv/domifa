import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { Transform, TransformFnParams, Type } from "class-transformer";
import {
  DEPARTEMENTS_MAP,
  MON_DOMIFA_CONTACT_RULES,
  MON_DOMIFA_CONTACT_SUBJECTS,
  MON_DOMIFA_CONTACT_SUBJECTS_DEF,
  MonDomifaContactSubject,
  REGIONS_LISTE,
  Telephone,
} from "@domifa/common";

import { IsValidPhone, StripTagsTransform } from "../../_common/decorators";
import { TelephoneDto } from "../../_common/dto/telephone.dto";
import { BaseContactSupportDto } from "./base-contact-support.dto";

const emptyToUndefined = ({ value }: TransformFnParams) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

// Contact form of the "Mon DomiFa" portal (domiciliés, not authenticated)
export class MonDomifaContactDto extends BaseContactSupportDto {
  // StripTagsTransform turns blank strings into null, rejected by @IsNotEmpty
  @IsNotEmpty()
  @IsString()
  @MaxLength(MON_DOMIFA_CONTACT_RULES.nameMaxLength)
  @StripTagsTransform({ removeInvisibleChars: true })
  public nom!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(MON_DOMIFA_CONTACT_RULES.nameMaxLength)
  @StripTagsTransform({ removeInvisibleChars: true })
  public prenom!: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TelephoneDto)
  @IsValidPhone("phone", false, false)
  public phone?: Telephone | null;

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
  @IsIn(MON_DOMIFA_CONTACT_SUBJECTS)
  public subject!: MonDomifaContactSubject;

  // Required for the subjects that need details, optional otherwise
  @ValidateIf(
    (dto: MonDomifaContactDto) =>
      !!MON_DOMIFA_CONTACT_SUBJECTS_DEF[dto.subject]?.requiresMessage ||
      (dto.content !== undefined && dto.content !== null)
  )
  @IsNotEmpty()
  @IsString()
  @MinLength(MON_DOMIFA_CONTACT_RULES.contentMinLength)
  @MaxLength(MON_DOMIFA_CONTACT_RULES.contentMaxLength)
  @StripTagsTransform({ multiline: true, removeInvisibleChars: true })
  public content?: string;
}
