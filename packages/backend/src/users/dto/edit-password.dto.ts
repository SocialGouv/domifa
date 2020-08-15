import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class EditPasswordDto {
  @IsNotEmpty()
  @MinLength(12, {
    message: "PASSWORD_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "PASSWORD_TOO_LONG",
  })
  public readonly oldPassword!: string;

  @IsNotEmpty()
  @MinLength(12, {
    message: "PASSWORD_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "PASSWORD_TOO_LONG",
  })
  public readonly password!: string;

  @IsNotEmpty()
  @MinLength(12, {
    message: "PASSWORD_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "PASSWORD_TOO_LONG",
  })
  public readonly confirmPassword!: string;
}
