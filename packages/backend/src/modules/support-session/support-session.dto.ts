import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { format, isValid, parse } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

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

const HISTORY_TIME_ZONE = "Europe/Paris";
const HISTORY_MIN_YEAR = 2025;

// "yyyy-mm-dd" -> start or end of that day in Paris time. Anything else (bad
// format, impossible date like 2025-02-30, year before support mode existed)
// becomes undefined, i.e. no filter on that bound.
const parseHistoryDay = (
  value: unknown,
  bound: "start" | "end"
): Date | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const day = parse(value, "yyyy-MM-dd", new Date());
  if (
    !isValid(day) ||
    format(day, "yyyy-MM-dd") !== value ||
    day.getFullYear() < HISTORY_MIN_YEAR
  ) {
    return undefined;
  }
  const time = bound === "start" ? "00:00:00.000" : "23:59:59.999";
  return zonedTimeToUtc(`${value}T${time}`, HISTORY_TIME_ZONE);
};

export class SupportSessionHistoryFiltersDto {
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => parseHistoryDay(value, "start"))
  public startDateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => parseHistoryDay(value, "end"))
  public startDateTo?: Date;
}
