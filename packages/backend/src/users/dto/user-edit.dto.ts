import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  MinLength
} from "class-validator";

export class UserEditDto {
  @MinLength(2, {
    message: "FIRSTNAME_TOO_SMALL"
  })
  @MaxLength(100, {
    message: "FIRSTNAME_TOO_LONG"
  })
  public readonly prenom: string;

  @MinLength(2, {
    message: "LASTNAME_TOO_SMALL"
  })
  @MaxLength(100, {
    message: "LASTNAME_TOO_LONG"
  })
  public readonly nom: string;

  @IsNotEmpty()
  @MinLength(11, {
    message: "PASSWORD_TOO_SMALL"
  })
  @MaxLength(100, {
    message: "PASSWORD_TOO_LONG"
  })
  public readonly password: string;

  @IsOptional()
  public readonly phone: string;
}
