import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { LowerCaseTransform, Trim } from "../../../_common/decorators";

export class GenerateOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  email: string;

  @IsOptional()
  @Trim()
  @IsString()
  purpose?: string;
}
