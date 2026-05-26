import { BREVO_EMAIL_EVENT_TYPES, BrevoEmailEventType } from "@domifa/common";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class BrevoEmailEventsQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  public readonly limit: number = 50;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  public readonly offset: number = 0;

  @ApiPropertyOptional({ enum: BREVO_EMAIL_EVENT_TYPES })
  @IsOptional()
  @IsIn(BREVO_EMAIL_EVENT_TYPES as unknown as string[])
  public readonly event?: BrevoEmailEventType;

  @ApiPropertyOptional({ minimum: 1, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  public readonly days?: number;
}
