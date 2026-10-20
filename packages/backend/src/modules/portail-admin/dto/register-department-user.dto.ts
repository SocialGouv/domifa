import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { DDETS_EMAIL_REGEX, DEPARTEMENTS_LISTE } from "@domifa/common";
import {
  LowerCaseTransform,
  StripTagsTransform,
} from "../../../_common/decorators";

// DDETS account invited by a DREETS from the pilotage portal
export class RegisterDepartmentUserDto {
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  public prenom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @StripTagsTransform()
  public nom!: string;

  @IsNotEmpty()
  @IsEmail()
  @Matches(DDETS_EMAIL_REGEX, { message: "INVALID_DDETS_EMAIL" })
  @LowerCaseTransform()
  public email!: string;

  @IsNotEmpty()
  @IsIn(Object.keys(DEPARTEMENTS_LISTE))
  public department!: string;
}
