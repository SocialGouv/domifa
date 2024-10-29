import {
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StructureCustomDocType } from "@domifa/common";
import { StripTagsTransform } from "../../_common/decorators";

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
  @IsBooleanString()
  public custom: boolean;

  @ApiProperty({
    type: "ENUM",
  })
  @ValidateIf((o) => o.custom === true)
  @IsIn(["attestation_postale", "courrier_radiation", "autre"])
  public customDocType?: StructureCustomDocType;
}
