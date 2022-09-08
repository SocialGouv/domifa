import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class UsagerLoginDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  public readonly login!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  public readonly password!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public readonly newPassword?: string;
}
