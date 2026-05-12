import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";
import { LowerCaseTransform, Trim } from "../../../_common/decorators";

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  email: string;

  @Trim()
  @IsString()
  @Matches(/^\d{6}$/, { message: "code doit contenir exactement 6 chiffres" })
  code: string;
}
