import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

import { StripTagsTransform } from "../../../_common/decorators";

export class UnblockUserDto {
  @StripTagsTransform()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  public motif!: string;
}
