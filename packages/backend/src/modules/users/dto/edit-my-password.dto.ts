import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { IsValidPassword, MatchField } from "../../../_common/decorators";

export class EditMyPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  @MaxLength(100)
  public readonly oldPassword!: string;

  @IsNotEmpty()
  @IsString()
  @IsValidPassword("password")
  public readonly password!: string;

  @IsNotEmpty()
  @IsString()
  @IsValidPassword("passwordConfirmation")
  @MatchField("password", { message: "PASSWORD_NOT_MATCH" })
  public readonly passwordConfirmation!: string;
}
