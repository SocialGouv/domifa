import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import { IsValidPassword, MatchField } from "../../../_common/decorators";

export class ResetPasswordDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsValidPassword("password")
  public readonly password!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsValidPassword("passwordConfirmation")
  @MatchField("password", { message: "PASSWORD_NOT_MATCH" })
  public readonly passwordConfirmation!: string;

  @MinLength(12)
  @MaxLength(500)
  @IsString()
  @IsNotEmpty()
  public readonly token!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }: TransformFnParams) => {
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  })
  public readonly userId!: number;
}
