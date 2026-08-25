import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { LowerCaseTransform } from "../../../_common/decorators";
import {
  UserStructureRole,
  UserFonction,
  ALL_USER_STRUCTURE_ROLES,
} from "@domifa/common";

export class RegisterUserStructureAdminDto {
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
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly nom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsIn(Object.keys(UserFonction))
  public readonly fonction!: UserFonction;

  @MinLength(2)
  @MaxLength(100)
  @IsString()
  @ValidateIf((u) => u.fonction === UserFonction.AUTRE)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (value) {
      return value.toString().trim();
    }
    return null;
  })
  public readonly fonctionDetail: string | null;

  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  public readonly email!: string;

  @IsNotEmpty()
  @IsIn(ALL_USER_STRUCTURE_ROLES)
  public readonly role!: UserStructureRole;

  @IsNotEmpty()
  @IsNumber()
  public structureId!: number;
}
