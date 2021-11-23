import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AdminLoginDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public readonly login!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public readonly password!: string;
}
