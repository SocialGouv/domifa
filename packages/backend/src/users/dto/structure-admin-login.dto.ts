import { ApiProperty } from "@nestjs/swagger";

import { IsEmail, IsNotEmpty } from "class-validator";
import { IsValidPassword } from "../../_common/decorators";
import { IsSocialGouvEmail } from "../../auth/decorators";

export class StructureAdminLoginDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @IsSocialGouvEmail()
  public readonly email!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsValidPassword("password", true)
  public readonly password!: string;
}
