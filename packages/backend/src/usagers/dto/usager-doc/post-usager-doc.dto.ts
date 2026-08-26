import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { StripTagsTransform } from "../../../_common/decorators";

export class PostUsagerDocDto {
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(2)
  @IsString()
  @StripTagsTransform()
  public label!: string;

  public file: any;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  public shared?: boolean;
}
