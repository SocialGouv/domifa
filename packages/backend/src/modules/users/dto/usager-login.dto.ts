import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  IsValidPassword,
  Trim,
  UpperCaseTransform,
} from "../../../_common/decorators";

export class UsagerLoginDto {
  @Trim()
  @UpperCaseTransform()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  public readonly login!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  public readonly password!: string;

  @IsOptional()
  @IsValidPassword("newPassword")
  public readonly newPassword?: string;
}
