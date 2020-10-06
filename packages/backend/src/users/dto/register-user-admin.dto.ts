import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsIn,
  IsEmpty,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterUserAdminDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @MinLength(2, {
    message: "PRENOM_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "PRENOM_TOO_LONG",
  })
  @IsNotEmpty()
  public readonly prenom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @MinLength(2, {
    message: "NOM_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "NOM_TOO_LONG",
  })
  @IsNotEmpty()
  public readonly nom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: ["admin", "simple", "facteur", "responsable"],
  })
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
