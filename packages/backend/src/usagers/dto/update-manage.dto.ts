import { IsISO8601, IsOptional, IsRFC3339 } from "class-validator";
import { IsDateTimeWithin } from "../../_common/decorators";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// lastSync comes from the database clock, checked against the pod clock
const ONE_HOUR_MS = 60 * 60 * 1000;

export class UpdateManageDto {
  // Date and time with a time zone only: always parseable by new Date()
  @IsOptional()
  @IsISO8601({ strict: true })
  @IsRFC3339()
  @IsDateTimeWithin({ maxPastMs: ONE_DAY_MS, maxFutureMs: ONE_HOUR_MS })
  public readonly since?: string;
}
