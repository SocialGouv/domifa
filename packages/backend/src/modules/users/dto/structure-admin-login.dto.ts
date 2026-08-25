import { IsEmail, IsNotEmpty } from "class-validator";
import {
  IsValidPassword,
  LowerCaseTransform,
  Trim,
} from "../../../_common/decorators";

export class StructureAdminLoginDto {
  @Trim()
  @LowerCaseTransform()
  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;

  @IsNotEmpty()
  @IsValidPassword("password", true)
  public readonly password!: string;
}
