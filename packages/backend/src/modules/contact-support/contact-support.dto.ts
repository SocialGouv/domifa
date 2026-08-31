import {
  IsEmail,
  IsEmpty,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

import {
  plainToInstance,
  Transform,
  TransformFnParams,
  Type,
} from "class-transformer";

import { MessageEmailAttachment } from "../mails/types/MessageEmailAttachment.type";
import {
  IsValidPhone,
  LowerCaseTransform,
  StripTagsTransform,
} from "../../_common/decorators";
import {
  CONTACT_SUPPORT_SUBJECTS,
  ContactSupportSubject,
  Telephone,
} from "@domifa/common";
import { cleanFormDataValue } from "../../util";
import { TelephoneDto } from "../../_common/dto/telephone.dto";

// Multipart/form-data delivers the nested telephone as a JSON string.
const parseMultipartTelephone = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null
      ? plainToInstance(TelephoneDto, parsed)
      : value;
  } catch {
    return value;
  }
};

export class ContactSupportDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(254)
  @LowerCaseTransform()
  public email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  @StripTagsTransform()
  public name!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  @StripTagsTransform()
  public structureName!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  @StripTagsTransform()
  public content!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: TransformFnParams) => {
    return cleanFormDataValue(value, "number");
  })
  public readonly structureId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: TransformFnParams) => {
    return cleanFormDataValue(value, "number");
  })
  public readonly userId!: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(CONTACT_SUPPORT_SUBJECTS)
  public subject!: ContactSupportSubject;

  // Only required when `subject` is the "AUTRE" (free text) option.
  @ValidateIf((dto: ContactSupportDto) => dto.subject === "AUTRE")
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  @StripTagsTransform()
  public subjectOther?: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => TelephoneDto)
  @Transform(({ value }: TransformFnParams) => parseMultipartTelephone(value))
  @IsValidPhone("phone", true, false)
  public phone!: Telephone;

  @IsEmpty()
  public attachment!: MessageEmailAttachment;
}
