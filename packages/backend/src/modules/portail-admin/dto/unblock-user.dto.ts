import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

import { StripTagsTransform } from "../../../_common/decorators";

export class UnblockUserDto {
  @ApiProperty({
    type: String,
    description: "Motif du déblocage (stocké dans les logs)",
    required: true,
    minLength: 3,
    maxLength: 500,
  })
  @StripTagsTransform()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  public motif!: string;
}
