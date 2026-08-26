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
import {
  StripTagsTransform,
  ValidateIfElseNull,
} from "../../../_common/decorators";

// Only HTML field of the API: produced by the DSFR editor (bold, italic,
// bullet list, link) and rendered with [innerHTML] on both portals.
const DESCRIPTION_HTML: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "div",
    "br",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "ul",
    "ol",
    "li",
    "a",
  ],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
};

export class StructureInformationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @StripTagsTransform()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @Transform(({ value }) =>
    typeof value === "string" ? sanitizeHtml(value, DESCRIPTION_HTML) : value
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
