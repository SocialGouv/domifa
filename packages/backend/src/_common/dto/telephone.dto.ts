import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsIn } from "class-validator";
import { TrimOrNullTransform } from "../decorators";
import { COUNTRY_CODES } from "../model/telephone";

export class TelephoneDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @TrimOrNullTransform()
  public numero: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.keys(COUNTRY_CODES))
  public countryCode: string;
}
