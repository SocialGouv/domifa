import { IsISO8601, IsOptional, IsRFC3339 } from "class-validator";

export class UpdateManageDto {
  // Date and time with a time zone only: always parseable by new Date()
  @IsOptional()
  @IsISO8601({ strict: true })
  @IsRFC3339()
  public readonly since?: string;
}
