import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { CONTACT_FORM_RULES } from "@domifa/common";

import {
  LowerCaseTransform,
  StripTagsTransform,
} from "../../_common/decorators";

// Fields shared by the structures contact form (ContactSupportDto) and the
// Mon DomiFa one (MonDomifaContactDto). Only fields with exactly the same
// rules belong here: class-validator merges the decorators of a redeclared
// property with the parent's ones, it never replaces them.
export abstract class BaseContactSupportDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(CONTACT_FORM_RULES.emailMaxLength)
  @LowerCaseTransform()
  public email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(CONTACT_FORM_RULES.structureNameMinLength)
  @MaxLength(CONTACT_FORM_RULES.structureNameMaxLength)
  @StripTagsTransform({ removeInvisibleChars: true })
  public structureName!: string;
}
