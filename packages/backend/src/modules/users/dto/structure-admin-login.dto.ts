import { ApiProperty } from "@nestjs/swagger";

import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import {
  IsValidPassword,
  LowerCaseTransform,
  Trim,
} from "../../../_common/decorators";

export class StructureAdminLoginDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @Trim()
  @LowerCaseTransform()
  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsValidPassword("password", true)
  public readonly password!: string;

  // Provided together with the current password when the account replies
  // CHANGE_PASSWORD_REQUIRED (password not renewed for more than a year).
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsValidPassword("newPassword")
  public readonly newPassword?: string;
}
