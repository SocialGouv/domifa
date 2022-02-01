import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PreferenceContactDto {
  @IsNotEmpty()
  @IsBoolean()
  public phone!: boolean;

  @ApiProperty({
    type: String,
    required: false,
  })
  @ValidateIf((o) => o.phone === true)
  @IsNotEmpty()
  @Length(10)
  @Matches(/^(06|07)(\d{2}){4}$/)
  public phoneNumber!: string;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  public email!: boolean;
}
