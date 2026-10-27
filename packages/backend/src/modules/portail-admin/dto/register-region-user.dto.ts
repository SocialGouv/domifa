import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import {
  DEPARTEMENTS_LISTE,
  NOMINATIVE_GOUV_EMAIL_REGEX,
  REGION_MANAGED_ROLES,
  RegionManagedRole,
  REGIONS_DEF,
} from "@domifa/common";
import {
  LowerCaseTransform,
  StripTagsTransform,
} from "../../../_common/decorators";

// DDETS or DREETS account invited by a DREETS from the pilotage portal
export class RegisterRegionUserDto {
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
  @Matches(NOMINATIVE_GOUV_EMAIL_REGEX, { message: "INVALID_NOMINATIVE_EMAIL" })
  @LowerCaseTransform()
  public email!: string;

  @IsIn(REGION_MANAGED_ROLES)
  public role!: RegionManagedRole;

  @ValidateIf((dto: RegisterRegionUserDto) => dto.role === "department")
  @IsNotEmpty()
  @IsIn(Object.keys(DEPARTEMENTS_LISTE))
  public department?: string;

  @ValidateIf((dto: RegisterRegionUserDto) => dto.role === "region")
  @IsNotEmpty()
  @IsIn(REGIONS_DEF.map((region) => region.regionCode))
  public region?: string;
}
