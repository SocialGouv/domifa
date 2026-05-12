import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { LowerCaseTransform, Trim } from "../../../_common/decorators";

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  @LowerCaseTransform()
  email: string;

  @IsNotEmpty()
  @Trim()
  @IsString()
  @Matches(/^\d{6}$/, { message: "code doit contenir exactement 6 chiffres" })
  code: string;
}
