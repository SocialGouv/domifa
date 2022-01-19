import { ApiProperty } from "@nestjs/swagger";
import {
  IsBooleanString,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsNumberString,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ContactStatus } from "../_common/model";

import { Transform, TransformFnParams } from "class-transformer";

import sanitizeHtml = require("sanitize-html");

export class ContactSupportDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  public email!: string;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsBooleanString()
  public hasAccount!: boolean;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @Transform(({ value }: TransformFnParams) => sanitizeHtml(value))
  public name!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @Transform(({ value }: TransformFnParams) => sanitizeHtml(value))
  public content!: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @ValidateIf((o) => o.hasAccount === true)
  @IsNumberString()
  @Transform(({ value }: TransformFnParams) => {
    return !value ? null : parseInt(value, 10);
  })
  structureId!: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @ValidateIf((o) => o.hasAccount === true)
  @IsNumberString()
  @Transform(({ value }: TransformFnParams) => {
    return !value ? null : parseInt(value, 10);
  })
  public userId!: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsEmpty()
  public status!: ContactStatus;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsEmpty()
  public file!: string;
}
