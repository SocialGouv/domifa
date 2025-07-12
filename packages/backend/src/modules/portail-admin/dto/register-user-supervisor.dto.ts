import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { IsValidGeographicRole } from "../../../_common/decorators";
import { UserSupervisorRole } from "@domifa/common";
import { USER_SUPERVISOR_ROLES } from "../../../_common/model/users/user-supervisor";
import { LowerCaseTransform } from "../../../_common/decorators/transformers";
import { IsSocialGouvEmailIfSuperAdmin } from "../decorators";

// Base DTO avec les propriétés communes
export abstract class BaseUserSupervisorDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public prenom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public nom!: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: USER_SUPERVISOR_ROLES,
  })
  @IsNotEmpty()
  @IsIn(USER_SUPERVISOR_ROLES)
  public role!: UserSupervisorRole;

  @ApiProperty({
    type: [String],
    required: true,
    description:
      "Région ou département selon le rôle (tableau vide pour national ou super-admin-domifa)",
  })
  @IsArray()
  @IsValidGeographicRole({
    message: "La valeur géographique doit correspondre au rôle sélectionné",
  })
  public territories!: string[];

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public fonction: string;
}

export class RegisterUserSupervisorDto extends BaseUserSupervisorDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  @IsSocialGouvEmailIfSuperAdmin({
    message:
      "Pour le rôle super-admin-domifa, l'email doit se terminer par @fabrique.social.gouv.fr ou @externes.social.gouv.fr",
  })
  public email!: string;
}

// DTO pour la mise à jour (sans email)
export class PatchUserSupervisorDto extends BaseUserSupervisorDto {}
