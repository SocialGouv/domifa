import { IsIn, IsNotEmpty, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StructureCustomDocType } from "../../_common/model";
import { Transform, TransformFnParams } from "class-transformer";

export class StructureDocDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @ValidateIf((o) => o.custom === true)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public label: string;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  public custom: boolean;

  @ApiProperty({
    type: Boolean,
  })
  @ValidateIf((o) => o.custom === true)
  @IsIn(["attestation_postale", "courrier_radiation", "autre"])
  public customDocType?: StructureCustomDocType;
}
