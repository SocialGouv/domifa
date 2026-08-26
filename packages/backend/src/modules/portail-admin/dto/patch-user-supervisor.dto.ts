import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  IsValidGeographicRole,
  StripTagsTransform,
  TERRITORY_CODES,
} from "../../../_common/decorators";
import { UserSupervisorRole } from "@domifa/common";
import { USER_SUPERVISOR_ASSIGNABLE_ROLES } from "../../../_common/model/users/user-supervisor";

export class PatchUserSupervisorDto {
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
  @IsIn(USER_SUPERVISOR_ASSIGNABLE_ROLES)
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
