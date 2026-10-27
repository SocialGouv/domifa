import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import {
  IsValidPassword,
  MatchField,
  StrictIntTransform,
} from "../../../_common/decorators";

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsValidPassword("password")
  public readonly password!: string;

  @IsNotEmpty()
  @IsString()
  @IsValidPassword("passwordConfirmation")
  @MatchField("password", { message: "PASSWORD_NOT_MATCH" })
  public readonly passwordConfirmation!: string;

  @MinLength(12)
  @MaxLength(500)
  @IsString()
  @IsNotEmpty()
  public readonly token!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @StrictIntTransform()
  public readonly userId!: number;
}
