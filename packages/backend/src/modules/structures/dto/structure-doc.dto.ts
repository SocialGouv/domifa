import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import {
  STRUCTURE_CUSTOM_DOC_AVAILABLE,
  StructureCustomDocType,
} from "@domifa/common";
import {
  StripTagsTransform,
  ValidateIfElseNull,
} from "../../../_common/decorators";
import { Transform } from "class-transformer";

const isCustomDoc = (o: { custom?: unknown }): boolean =>
  o.custom === true || o.custom === "true";

const isLabelValidated = (o: StructureDocDto, value: unknown): boolean =>
  isCustomDoc(o) || (value !== null && value !== undefined);

export class StructureDocDto {
  @ValidateIf(isLabelValidated)
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
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

  @ValidateIfElseNull(isCustomDoc)
  @IsIn(STRUCTURE_CUSTOM_DOC_AVAILABLE)
  public customDocType?: StructureCustomDocType;
}
