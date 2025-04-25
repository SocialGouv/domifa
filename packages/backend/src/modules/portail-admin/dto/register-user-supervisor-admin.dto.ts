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

export class RegisterUserSupervisorAdminDto {
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
  public readonly prenom!: string;

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
  public readonly nom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  public readonly email!: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: USER_SUPERVISOR_ROLES,
  })
  @IsNotEmpty()
  @IsIn(USER_SUPERVISOR_ROLES)
  public readonly role!: UserSupervisorRole;

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
}
