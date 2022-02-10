import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { ContactStatus } from "../../_common/model";

import { Transform, TransformFnParams } from "class-transformer";

import sanitizeHtml = require("sanitize-html");
import { MessageEmailAttachment } from "../../database/entities/message-email/MessageEmailAttachment.type";

export class ContactSupportDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  public email!: string;

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
  @MinLength(2)
  @Transform(({ value }: TransformFnParams) => sanitizeHtml(value))
  public structureName!: string;

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
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return !value ? null : parseInt(value, 10);
  })
  public readonly structureId!: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return !value ? null : parseInt(value, 10);
  })
  public readonly userId!: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsEmpty()
  public status!: ContactStatus;

  @ApiProperty({
    type: String,
  })
  @IsEmpty()
  public attachment!: MessageEmailAttachment;
}
