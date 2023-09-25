import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { UpperCaseTransform } from "../../_common/decorators";

export class UsagerLoginDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @UpperCaseTransform()
  public readonly login!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  public readonly password!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @MinLength(8)
  public readonly newPassword?: string;
}
