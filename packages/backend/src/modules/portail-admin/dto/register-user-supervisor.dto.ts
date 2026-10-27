import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import { IsValidGeographicRole, IsValidSuperAdminEmail } from "../decorators";
import { UserSupervisorRole } from "@domifa/common";
import {
  LowerCaseTransform,
  StripTagsTransform,
  TERRITORY_CODES,
} from "../../../_common/decorators";
import { USER_SUPERVISOR_ROLES } from "../../../_common/model/users/user-supervisor";

export class RegisterUserSupervisorDto {
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  public prenom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  public nom!: string;

  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  @IsValidSuperAdminEmail()
  public email!: string;

  @IsNotEmpty()
  @IsIn(USER_SUPERVISOR_ROLES)
  public role!: UserSupervisorRole;

  @IsArray()
  @ArrayMaxSize(TERRITORY_CODES.length)
  @IsString({ each: true })
  @MaxLength(3, { each: true })
  @IsIn(TERRITORY_CODES, { each: true })
  @ArrayUnique()
  @IsValidGeographicRole({
    message: "La valeur géographique doit correspondre au rôle sélectionné",
  })
  public territories!: string[];
}
