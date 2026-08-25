import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

import { IsValidGeographicRole } from "../decorators";
import { UserSupervisorRole } from "@domifa/common";
import { LowerCaseTransform } from "../../../_common/decorators";
import { USER_SUPERVISOR_ASSIGNABLE_ROLES } from "../../../_common/model/users/user-supervisor";

export class RegisterUserSupervisorDto {
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public prenom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public nom!: string;

  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  public email!: string;

  @IsNotEmpty()
  @IsIn(USER_SUPERVISOR_ASSIGNABLE_ROLES)
  public role!: UserSupervisorRole;

  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  @IsValidGeographicRole({
    message: "La valeur géographique doit correspondre au rôle sélectionné",
  })
  public territories!: string[];
}
