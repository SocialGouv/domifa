import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from "class-validator";

export class UserDto {
  @MinLength(2, {
    message: "PRENOM_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "PRENOM_TOO_LONG",
  })
  @IsNotEmpty()
  public readonly prenom!: string;

  @MinLength(2, {
    message: "NOM_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "NOM_TOO_LONG",
  })
  @IsNotEmpty()
  public readonly nom!: string;

  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;

  @IsOptional()
  public readonly phone!: string;

  @IsNotEmpty()
  @MinLength(12, {
    message: "PASSWORD_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "PASSWORD_TOO_LONG",
  })
  public readonly password!: string;

  @IsEmpty()
  public readonly structureId?: number;

  @IsEmpty()
  public readonly structure?: {};
}
