import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

import { Transform, TransformFnParams } from "class-transformer";

import { MessageEmailAttachment } from "../../database/entities/message-email/MessageEmailAttachment.type";
import { IsValidPhone, LowerCaseTransform } from "../../_common/decorators";
import sanitizeHtml from "sanitize-html";
import { Telephone } from "@domifa/common";
import { cleanFormDataValue } from "../../util";

export class ContactSupportDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  public email!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @Transform(({ value }: TransformFnParams) => {
    value = sanitizeHtml(value);
    return value.toString().trim();
  })
  public name!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @Transform(({ value }: TransformFnParams) => {
    value = sanitizeHtml(value);
    return value.toString().trim();
  })
  public structureName!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @Transform(({ value }: TransformFnParams) => {
    value = sanitizeHtml(value);
    return value.toString().trim();
  })
  public content!: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return cleanFormDataValue(value, "number");
  })
  public readonly structureId!: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return cleanFormDataValue(value, "number");
  })
  public readonly userId!: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    value = sanitizeHtml(value);
    return value.toString().trim();
  })
  public subject!: string;

  @IsValidPhone("phone", false, false)
  public phone!: Telephone;

  @IsEmpty()
  public attachment!: MessageEmailAttachment;
}
