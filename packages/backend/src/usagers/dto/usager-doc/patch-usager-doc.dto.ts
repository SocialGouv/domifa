import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { StripTagsTransform } from "../../../_common/decorators";

export class PatchUsagerDocDto {
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(2)
  @IsString()
  @StripTagsTransform()
  public label!: string;

  @IsNotEmpty()
  @IsBoolean()
  public shared!: boolean;
}
