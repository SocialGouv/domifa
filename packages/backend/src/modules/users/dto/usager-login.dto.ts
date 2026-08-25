import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
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
  public readonly login!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  public readonly password!: string;

  @IsOptional()
  @IsValidPassword("newPassword")
  public readonly newPassword?: string;
}
