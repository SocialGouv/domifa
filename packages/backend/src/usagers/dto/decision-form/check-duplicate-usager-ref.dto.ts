import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { StripTagsTransform, Trim } from "../../../_common/decorators";

export class CheckDuplicateUsagerRefDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  @MaxLength(100)
  @Trim()
  public customRef!: string;
}
