import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsIn,
  IsBoolean,
  MaxLength,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { StructureInformationType } from "@domifa/common";
import sanitizeHtml from "sanitize-html";
import { ValidateIfElseNull } from "../../../_common/decorators";

export class StructureInformationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => sanitizeHtml(value, { allowedTags: [] }))
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @Transform(({ value }) =>
    sanitizeHtml(value, {
      allowedTags: [
        "b",
        "strong",
        "i",
        "em",
        "ul",
        "ol",
        "li",
        "br",
        "p",
        "br",
        "u",
      ],
      allowedAttributes: {},
    })
  )
  description: string;

  @ValidateIfElseNull((o) => o.isTemporary === true)
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @ValidateIfElseNull((o) => o.isTemporary === true)
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  isTemporary: boolean;

  @IsIn(["closing", "opening-hours", "general", "other"])
  @IsNotEmpty()
  type: StructureInformationType;
}
