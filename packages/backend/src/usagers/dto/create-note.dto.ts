import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { StripTagsTransform } from "../../_common/decorators";

export class CreateNoteDto {
  @ApiProperty({
    type: String,
    required: true,
    maxLength: 1000,
  })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(1000)
  @IsString()
  @StripTagsTransform()
  public message!: string;
}
