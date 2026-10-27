import { BREVO_EMAIL_EVENT_TYPES, BrevoEmailEventType } from "@domifa/common";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { StrictIntTransform } from "../../../_common/decorators";

export class BrevoEmailEventsQueryDto {
  @IsOptional()
  @StrictIntTransform()
  @IsInt()
  @Min(1)
  @Max(100)
  public readonly limit: number = 50;

  @IsOptional()
  @StrictIntTransform()
  @IsInt()
  @Min(0)
  public readonly offset: number = 0;

  @IsOptional()
  @IsIn(BREVO_EMAIL_EVENT_TYPES as unknown as string[])
  public readonly event?: BrevoEmailEventType;

  @IsOptional()
  @StrictIntTransform()
  @IsInt()
  @Min(1)
  @Max(90)
  public readonly days?: number;
}
