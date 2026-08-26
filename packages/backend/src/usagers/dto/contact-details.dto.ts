import { Telephone } from "@domifa/common";
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from "class-validator";
import {
  TrimOrNullTransform,
  LowerCaseTransform,
  IsValidPhone,
} from "../../_common/decorators";
import { Type } from "class-transformer";
import { TelephoneDto } from "../../_common/dto/telephone.dto";

export class ContactDetailsDto {
  @IsOptional()
  @IsEmail()
  @TrimOrNullTransform()
  @LowerCaseTransform()
  public email!: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TelephoneDto)
  @IsValidPhone("telephone", false, true)
  public telephone!: Telephone;

  @IsNotEmpty()
  @IsBoolean()
  public contactByPhone!: boolean;
}
