import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

import { PageOptionsDto } from "../../../usagers/dto/pagination/page-options.dto";
import { SUSPICIOUS_LOG_ACTIONS } from "../../security-monitoring/constants/SECURITY_LOG_ACTIONS.const";
import { SuspiciousLogAction } from "../../security-monitoring/types/security-alert.types";

export const SUSPICIOUS_USER_PROFILES = [
  "user_structure",
  "user_supervisor",
] as const;
export type SuspiciousUserProfile = (typeof SUSPICIOUS_USER_PROFILES)[number];

export const SUSPICIOUS_FILTER_USER_TYPES = [
  "user_structure",
  "user_supervisor",
  "usager",
  "anonymous",
  "system",
] as const;
export type SuspiciousFilterUserType =
  (typeof SUSPICIOUS_FILTER_USER_TYPES)[number];

export class SuspiciousActivityQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: SUSPICIOUS_LOG_ACTIONS, isArray: true })
  @IsOptional()
  // ?actions=X (single value) is parsed as a string by Express's qs parser —
  // coerce it back to an array so @IsArray + @IsIn(each) work consistently
  // whether the caller sends one or several `actions=` params.
  @Transform(({ value }) =>
    value === undefined || value === null
      ? value
      : Array.isArray(value)
      ? value
      : [value]
  )
  @IsArray()
  @IsIn(SUSPICIOUS_LOG_ACTIONS, { each: true })
  readonly actions?: SuspiciousLogAction[];

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly dateFrom?: Date;

  @ApiPropertyOptional({ type: Date })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly dateTo?: Date;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly ip?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly identifier?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly userId?: number;

  @ApiPropertyOptional({ enum: SUSPICIOUS_FILTER_USER_TYPES })
  @IsOptional()
  @IsIn(SUSPICIOUS_FILTER_USER_TYPES)
  readonly userType?: SuspiciousFilterUserType;
}
