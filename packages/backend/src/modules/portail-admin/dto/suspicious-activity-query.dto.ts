import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
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

export class SuspiciousActivityQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: SUSPICIOUS_LOG_ACTIONS, isArray: true })
  @IsOptional()
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

  @ApiPropertyOptional({ enum: SUSPICIOUS_USER_PROFILES })
  @IsOptional()
  @IsIn(SUSPICIOUS_USER_PROFILES)
  readonly userType?: SuspiciousUserProfile;
}
