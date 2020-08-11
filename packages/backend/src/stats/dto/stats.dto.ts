import { IsIn, IsOptional, IsDateString } from "class-validator";

export class StatsDto {
  @IsDateString()
  @IsOptional()
  public start!: string;

  @IsDateString()
  @IsOptional()
  public end!: string;
}
