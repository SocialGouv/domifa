import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { StripTagsTransform, Trim } from "../../../_common/decorators";

export class PostUsagerDocDto {
  @ApiProperty({
    type: String,
    required: true,
    maxLength: 100,
  })
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(2)
  @IsString()
  @Trim()
  @StripTagsTransform()
  public label!: string;

  @ApiProperty({ type: "string", format: "binary" })
  public file: any;
}
