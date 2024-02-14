import { Telephone } from "@domifa/common";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsOptional,
  IsEmail,
  ValidateNested,
  IsNotEmpty,
  IsBoolean,
} from "class-validator";
import {
  TrimOrNullTransform,
  LowerCaseTransform,
} from "../../_common/decorators";
import { TelephoneDto } from "../../_common/dto";

export class ContactDetailsDto {
  @ApiProperty({
    example: "test@test.fr",
    description: "Email de l'usager",
  })
  @IsOptional()
  @IsEmail()
  @TrimOrNullTransform()
  @LowerCaseTransform()
  public email!: string;

  @ApiProperty({
    type: Object,
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TelephoneDto)
  public telephone!: Telephone;

  @IsNotEmpty()
  @IsBoolean()
  public contactByPhone!: boolean;
}
