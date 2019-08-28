import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsNotEmpty()
  @MinLength(12, {
    message: "PASSWORD_TOO_SMALL"
  })
  @MaxLength(100, {
    message: "PASSWORD_TOO_LONG"
  })
  public readonly password: string;

  @IsNotEmpty()
  public readonly token: string;
}
