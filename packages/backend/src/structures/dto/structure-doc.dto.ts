import {
  IsBoolean,
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StructureCustomDocType } from "../../_common/model";

export class StructureDocDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @ValidateIf((o) => o.custom === true)
  label: string;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  custom: boolean;

  @ApiProperty({
    type: Boolean,
  })
  @ValidateIf((o) => o.custom === true)
  @IsIn(["attestation_postale", "courrier_radiation", "autre"])
  customDocType?: StructureCustomDocType;
}
