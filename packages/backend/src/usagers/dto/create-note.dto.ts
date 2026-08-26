import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { StripTagsTransform } from "../../_common/decorators";

export class CreateNoteDto {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  @IsString()
  @StripTagsTransform({ multiline: true })
  public message!: string;
}
