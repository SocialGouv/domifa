import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GenerateOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}
