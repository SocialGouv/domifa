import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Trim } from "../../_common/decorators";

export class UploadUsagerDocDto {
  @ApiProperty({
    type: String,
    required: true,
    maxLength: 100,
  })
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  @Trim()
  public label!: string;

  @ApiProperty({ type: "string", format: "binary" })
  public file: any;
}
