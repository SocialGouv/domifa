import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { LowerCaseTransform } from "../../../_common/decorators";
import { UserSupervisorRole } from "@domifa/common";
import { USER_SUPERVISOR_ROLES } from "../../../_common/model/users/user-supervisor";

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

  // TODO: territories
}
