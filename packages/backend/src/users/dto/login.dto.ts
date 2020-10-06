import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
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
  public readonly password!: string;
}
