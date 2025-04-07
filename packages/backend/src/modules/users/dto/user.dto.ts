import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { IsValidPassword, Trim } from "../../../_common/decorators";
import { StructureCommon } from "@domifa/common";

export class UserDto {
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly prenom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Trim()
  public readonly nom!: string;

  @IsNotEmpty()
  @IsEmail()
  @Trim()
  public readonly email!: string;

  @IsNotEmpty()
  @IsValidPassword("password")
  public readonly password!: string;

  @IsEmpty()
  public readonly structureId?: number;

  @IsEmpty()
  public structure?: StructureCommon;
}
