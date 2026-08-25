import { Telephone } from "@domifa/common";
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
  @IsOptional()
  @IsEmail()
  @TrimOrNullTransform()
  @LowerCaseTransform()
  public email!: string;

  @IsObject()
  @IsNotEmpty()
  @IsValidPhone("telephone", false, true)
  public telephone!: Telephone;

  @IsNotEmpty()
  @IsBoolean()
  public contactByPhone!: boolean;
}
