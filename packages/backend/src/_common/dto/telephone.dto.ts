import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsIn } from "class-validator";

import CountryCode from "../../util/countryCode";

export class TelephoneDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  public numero: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.keys(CountryCode))
  public indicatif: string;
}
