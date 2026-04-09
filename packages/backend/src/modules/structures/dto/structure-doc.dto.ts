import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {
  STRUCTURE_CUSTOM_DOC_AVAILABLE,
  StructureCustomDocType,
} from "@domifa/common";
import { StripTagsTransform } from "../../../_common/decorators";
import { Transform } from "class-transformer";

export class StructureDocDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @ValidateIf((o) => o.custom === true)
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @StripTagsTransform()
  public label: string;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return value;
  })
  public custom: boolean;

  @ApiProperty({
    type: "string",
  })
  @ValidateIf((o) => o.custom === true)
  @IsIn(STRUCTURE_CUSTOM_DOC_AVAILABLE)
  public customDocType?: StructureCustomDocType;
}
