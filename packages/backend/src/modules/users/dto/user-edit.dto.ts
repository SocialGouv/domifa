import { UserFonction } from "@domifa/common";
import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  StripTagsTransform,
  ValidateIfElseNull,
} from "../../../_common/decorators";

export class UserEditDto {
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  public readonly prenom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  public readonly nom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsIn(Object.keys(UserFonction))
  @IsString()
  public readonly fonction!: UserFonction;

  @MinLength(2)
  @MaxLength(255)
  @IsString()
  @ValidateIfElseNull((u) => u.fonction === UserFonction.AUTRE)
  @IsNotEmpty()
  @StripTagsTransform()
  public readonly fonctionDetail: string | null;
}
