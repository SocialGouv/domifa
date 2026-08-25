import { IsEmail, IsNotEmpty } from "class-validator";
import { LowerCaseTransform } from "../../../_common/decorators";

export class EmailDto {
  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  public readonly email!: string;
}
