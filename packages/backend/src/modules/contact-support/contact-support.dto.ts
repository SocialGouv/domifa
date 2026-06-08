import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import { Transform, TransformFnParams } from "class-transformer";

import { MessageEmailAttachment } from "../mails/types/MessageEmailAttachment.type";
import {
  IsValidPhone,
  LowerCaseTransform,
  StripTagsTransform,
} from "../../_common/decorators";
import sanitizeHtml from "sanitize-html";
import { Telephone } from "@domifa/common";
import { cleanFormDataValue } from "../../util";

export class ContactSupportDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(254)
  @LowerCaseTransform()
  public email!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  @StripTagsTransform()
  public name!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  @StripTagsTransform()
  public structureName!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  @StripTagsTransform()
  public content!: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: TransformFnParams) => {
    return cleanFormDataValue(value, "number");
  })
  public readonly structureId!: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: TransformFnParams) => {
    return cleanFormDataValue(value, "number");
  })
  public readonly userId!: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  @Transform(({ value }: TransformFnParams) => {
    value = sanitizeHtml(value);
    return value.toString().trim();
  })
  public subject!: string;

  @Transform(({ value }: TransformFnParams) => {
    // Multipart/form-data delivers JSON-encoded objects as strings — parse
    // safely so downstream code receives a real Telephone object.
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        return value;
      }
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return value;
    }
    // Explicit allowlist: blocks prototype pollution and strips junk keys.
    return {
      numero: typeof value.numero === "string" ? value.numero : undefined,
      countryCode:
        typeof value.countryCode === "string" ? value.countryCode : undefined,
    };
  })
  @IsValidPhone("phone", true, false)
  public phone!: Telephone;

  @IsEmpty()
  public attachment!: MessageEmailAttachment;
}
