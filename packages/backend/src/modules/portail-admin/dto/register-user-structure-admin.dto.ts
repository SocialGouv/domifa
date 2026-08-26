import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  LowerCaseTransform,
  StripTagsTransform,
  ValidateIfElseNull,
} from "../../../_common/decorators";
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
  @StripTagsTransform()
  public readonly prenom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  public readonly nom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsIn(Object.keys(UserFonction))
  public readonly fonction!: UserFonction;

  @MinLength(2)
  @MaxLength(100)
  @IsString()
  @ValidateIfElseNull((u) => u.fonction === UserFonction.AUTRE)
  @IsNotEmpty()
  @StripTagsTransform()
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
