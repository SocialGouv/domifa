import { COUNTRY_CODES, Telephone } from "@domifa/common";
import { IsIn, IsString, Matches, MaxLength } from "class-validator";

export class TelephoneDto implements Telephone {
  @IsIn(Object.keys(COUNTRY_CODES))
  public countryCode!: string;

  @IsString()
  @MaxLength(20)
  @Matches(/^[+\d\s.\-()/]*$/)
  public numero!: string;
}
