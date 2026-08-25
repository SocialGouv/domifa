import { Telephone } from "@domifa/common";
import { IsString, Matches, MaxLength } from "class-validator";

export class TelephoneDto implements Telephone {
  @IsString()
  @Matches(/^[a-z]{2}$/)
  public countryCode!: string;

  @IsString()
  @MaxLength(20)
  public numero!: string;
}
