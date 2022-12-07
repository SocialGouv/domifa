import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  MinLength,
} from "class-validator";

import { IsValidPassword } from "../../_common/decorators";

export class ResetPasswordDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsValidPassword("password", {
    message: "INCORRECT_PASSWORD",
  })
  public readonly password!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsValidPassword("confirmPassword", {
    message: "INCORRECT_PASSWORD",
  })
  @Transform(({ value, obj }: TransformFnParams) => {
    if (
      typeof obj.password !== "undefined" &&
      typeof obj.confirmPassword !== "undefined"
    ) {
      if (
        typeof obj.password === "string" &&
        typeof obj.confirmPassword === "string" &&
        obj.password === obj.confirmPassword
      ) {
        return value;
      }
    }
    throw new BadRequestException("PASSWORD_NOT_MATCH");
  })
  public readonly confirmPassword!: string;

  @MinLength(12)
  @IsString()
  @IsNotEmpty()
  public readonly token!: string;

  @IsNotEmpty()
  @IsNumberString()
  public readonly userId!: number;
}
