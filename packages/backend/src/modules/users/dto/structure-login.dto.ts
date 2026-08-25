import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import {
  IsValidPassword,
  LowerCaseTransform,
  Trim,
} from "../../../_common/decorators";

export class StructureLoginDto {
  @Trim()
  @LowerCaseTransform()
  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;

  @IsNotEmpty()
  @IsValidPassword("password", true)
  public readonly password!: string;

  // Previous trust JWT (extracted client-side from the previous access JWT).
  // When provided and valid (signature + exp + sessionUuid + fingerprint match),
  // the login skips the OTP step. The OTP code itself, when needed for the
  // second leg, is read from the `Otp-Code` header — same convention as the
  // OtpGuard so the existing front-end OtpInterceptor retry flow works.
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  public readonly trustToken?: string;
}
