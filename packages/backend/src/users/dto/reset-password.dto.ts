import { ApiProperty } from "@nestjs/swagger";
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
  @IsValidPassword()
  public readonly password!: string;

  @MinLength(12)
  @IsString()
  @IsNotEmpty()
  public readonly token!: string;

  @IsNotEmpty()
  @IsNumberString()
  public readonly userId!: number;
}
