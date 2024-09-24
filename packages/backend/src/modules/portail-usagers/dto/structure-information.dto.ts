import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsEnum,
  IsBoolean,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { StructureInformationType } from "@domifa/common";
import sanitizeHtml from "sanitize-html";

export class StructureInformationDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => sanitizeHtml(value, { allowedTags: [] }))
  title: string;

  @IsString()
  @IsNotEmpty()
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

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate: Date | null;

  @IsBoolean()
  @IsNotEmpty()
  isTemporary: boolean;

  @IsEnum(["closing", "opening-hours", "general", "other"])
  type: StructureInformationType;
}
