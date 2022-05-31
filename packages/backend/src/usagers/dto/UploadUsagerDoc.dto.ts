import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UploadUsagerDocDto {
  @ApiProperty({
    type: String,
    required: true,
    maxLength: 100,
  })
  @IsNotEmpty()
  public label!: string;

  @ApiProperty({ type: "string", format: "binary" })
  public file: any;
}
