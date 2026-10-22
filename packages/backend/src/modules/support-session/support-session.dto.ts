import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import {
  SUPPORT_SESSION_REASON_MAX_LENGTH,
  SUPPORT_SESSION_REASON_MIN_LENGTH,
} from "@domifa/common";
import { StripTagsTransform, Trim } from "../../_common/decorators";

export class ActivateSupportSessionDto {
  // Why the super-admin needs to look into this structure: kept on the
  // support_session row as an audit trail.
  @IsNotEmpty()
  @IsString()
  @MinLength(SUPPORT_SESSION_REASON_MIN_LENGTH)
  @MaxLength(SUPPORT_SESSION_REASON_MAX_LENGTH)
  @Trim()
  @StripTagsTransform()
  public reason!: string;
}

export class SupportSessionHistoryFiltersDto {
  // ISO datetimes, computed client-side from the admin's local day bounds.
  @IsOptional()
  @IsISO8601()
  public startDateFrom?: string;

  @IsOptional()
  @IsISO8601()
  public startDateTo?: string;
}
