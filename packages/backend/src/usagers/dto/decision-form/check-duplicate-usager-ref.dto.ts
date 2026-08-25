import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { StripTagsTransform, Trim } from "../../../_common/decorators";

export class CheckDuplicateUsagerRefDto {
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  @MaxLength(100)
  @Trim()
  public customRef!: string;
}
