import { IsISO8601, IsOptional } from "class-validator";

export class UpdateManageDto {
  @IsOptional()
  @IsISO8601({ strict: true })
  public readonly since?: string;
}
