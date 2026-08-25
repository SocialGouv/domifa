import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { StripTagsTransform, Trim } from "../../../_common/decorators";

export class PatchUsagerDocDto {
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(2)
  @IsString()
  @Trim()
  @StripTagsTransform()
  public label!: string;

  @IsNotEmpty()
  @IsBoolean()
  public shared!: boolean;
}
