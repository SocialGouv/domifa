import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from "class-validator";
import { StructureCommon } from "../../_common/model";

export class UserDto {
  @MinLength(2, {
    message: "PRENOM_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "PRENOM_TOO_LONG",
  })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly prenom!: string;

  @MinLength(2, {
    message: "NOM_TOO_SMALL",
  })
  @MaxLength(100, {
    message: "NOM_TOO_LONG",
  })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly nom!: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly email!: string;

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
  public structure?: StructureCommon;
}
