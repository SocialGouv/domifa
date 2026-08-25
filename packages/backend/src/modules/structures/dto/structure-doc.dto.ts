import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from "class-validator";
import {
  STRUCTURE_CUSTOM_DOC_AVAILABLE,
  StructureCustomDocType,
} from "@domifa/common";
import {
  StripTagsTransform,
  Trim,
  ValidateIfElseNull,
} from "../../../_common/decorators";
import { Transform } from "class-transformer";

export class StructureDocDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Trim()
  @StripTagsTransform()
  public label: string;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return value;
  })
  public custom: boolean;

  @ValidateIfElseNull((o) => o.custom === true || o.custom === "true")
  @IsIn(STRUCTURE_CUSTOM_DOC_AVAILABLE)
  public customDocType?: StructureCustomDocType;
}
