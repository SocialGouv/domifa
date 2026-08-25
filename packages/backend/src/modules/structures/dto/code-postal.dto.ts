import { IsNotEmpty, IsString, Matches } from "class-validator";
import { ValidationRegexp } from "../../../usagers/controllers/import/step2-validate-row";

export class CodePostalDto {
  @IsNotEmpty()
  @IsString()
  @Matches(ValidationRegexp.postcode)
  public codePostal!: string;
}
