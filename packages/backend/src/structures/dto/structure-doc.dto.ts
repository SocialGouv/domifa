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
  label: string;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsBooleanString()
  custom: boolean;

  @ApiProperty({
    type: Boolean,
  })
  @ValidateIf((o) => o.custom === true)
  @IsIn(["ATTESTATION_POSTALE", "COURRIER_RADIATION", "AUTRE"])
  customDocType?: StructureCustomDocType;
}
