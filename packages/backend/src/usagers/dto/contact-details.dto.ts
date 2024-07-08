import { Telephone } from "@domifa/common";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsObject,
} from "class-validator";
import {
  TrimOrNullTransform,
  LowerCaseTransform,
  IsValidPhone,
} from "../../_common/decorators";

export class ContactDetailsDto {
  @ApiProperty({
    example: "test@test.fr",
    description: "Email du domicilié",
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
  @IsObject()
  @IsNotEmpty()
  @IsValidPhone("telephone", false, true)
  public telephone!: Telephone;

  @IsNotEmpty()
  @IsBoolean()
  public contactByPhone!: boolean;
}
