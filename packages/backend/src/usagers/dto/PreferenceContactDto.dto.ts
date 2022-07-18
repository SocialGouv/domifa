import { Type } from "class-transformer";
import {
  IsBoolean,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  Length,
  Matches,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { Telephone } from "../../_common/model";
import { TelephoneDto } from "../../_common/dto";

export class PreferenceContactDto {
  @IsNotEmpty()
  @IsBoolean()
  public contactByPhone!: boolean;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @Length(10)
  @Matches(/^(06|07)(\d{2}){4}$/)
  public phoneNumber!: string;

  @ApiProperty({
    type: Object,
    required: true,
  })
  @ValidateIf((o) => o.phone === true)
  @ValidateNested({ each: true })
  @Type(() => TelephoneDto)
  public telephone!: Telephone;
}
