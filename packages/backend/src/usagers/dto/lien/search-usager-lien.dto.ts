import { IsString, MaxLength, MinLength } from "class-validator";
import { StripTagsTransform } from "../../../_common/decorators";

export class SearchUsagerLienDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @StripTagsTransform()
  public query!: string;
}
