import { IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidPassword } from "../../_common/decorators";
import { BadRequestException } from "@nestjs/common";

export class EditMyPasswordDto {
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(100)
  public readonly oldPassword!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsValidPassword()
  public readonly password!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsValidPassword()
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
}
