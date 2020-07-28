import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class UserEditDto {
  @MinLength(2, {
    message: "FIRSTNAME_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "FIRSTNAME_TOO_LONG",
  })
  @IsNotEmpty()
  public readonly prenom!: string;

  @MinLength(2, {
    message: "LASTNAME_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "LASTNAME_TOO_LONG",
  })
  @IsNotEmpty()
  public readonly nom!: string;

  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;
}
