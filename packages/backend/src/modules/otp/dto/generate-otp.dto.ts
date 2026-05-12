import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { LowerCaseTransform, Trim } from "../../../_common/decorators";

export class GenerateOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  @LowerCaseTransform()
  email: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  purpose?: string;
}
