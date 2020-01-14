import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  MinLength
} from "class-validator";

export class UserDto {
  @MinLength(2, {
    message: "PRENOM_TOO_SMALL"
  })
  @MaxLength(100, {
    message: "PRENOM_TOO_LONG"
  })
  @IsNotEmpty()
  public readonly prenom!: string;

  @MinLength(2, {
    message: "NOM_TOO_SMALL"
  })
  @MaxLength(100, {
    message: "NOM_TOO_LONG"
  })
  @IsNotEmpty()
  public readonly nom!: string;

  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;

  @IsNotEmpty()
  @MinLength(11, {
    message: "PASSWORD_TOO_SMALL"
  })
  @MaxLength(100, {
    message: "PASSWORD_TOO_LONG"
  })
  public readonly password!: string;

  @IsNotEmpty()
  @IsNumber()
  public readonly structureId!: number;

  @IsOptional()
  public readonly structure!: {};

  @IsOptional()
  public readonly phone!: string;
}
