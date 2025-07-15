import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { IsValidPassword, Trim } from "../../../_common/decorators";
import { StructureCommon, UserFonction } from "@domifa/common";

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

  @MinLength(2)
  @MaxLength(100)
  @IsIn(Object.keys(UserFonction))
  @IsString()
  public readonly fonction!: UserFonction;

  @MinLength(2)
  @MaxLength(255)
  @IsString()
  @ValidateIf((u) => u.fonction === UserFonction.AUTRE)
  @IsNotEmpty()
  public readonly fonctionDetail: string | null;

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
