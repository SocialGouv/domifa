import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsIn,
  IsEmpty,
} from "class-validator";

export class RegisterUserAdminDto {
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

  @IsNotEmpty()
  @IsIn(["admin", "simple", "facteur", "responsable"])
  public readonly role!: string;

  @IsEmpty()
  public structureId!: number;

  @IsEmpty()
  public structure!: {};

  @IsEmpty()
  public verified!: boolean;
}
