import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { StripTagsTransform, Trim } from "../../_common/decorators";

export class CreateNoteDto {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  @IsString()
  @StripTagsTransform()
  @Trim()
  public message!: string;
}
