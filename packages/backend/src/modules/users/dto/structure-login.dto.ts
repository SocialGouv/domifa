import { ApiProperty } from "@nestjs/swagger";

import { IsEmail, IsNotEmpty } from "class-validator";
import { IsValidPassword } from "../../../_common/decorators";

export class StructureLoginDto {
  @ApiProperty({
    type: String,
    required: true,
  })
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
}
