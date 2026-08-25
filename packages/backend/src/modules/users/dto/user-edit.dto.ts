import { UserFonction } from "@domifa/common";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ValidateIfElseNull } from "../../../_common/decorators";

export class UserEditDto {
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly prenom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
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
  @Transform(({ value }: TransformFnParams) => {
    if (value) {
      return value.toString().trim();
    }
    return null;
  })
  public readonly fonctionDetail: string | null;
}
