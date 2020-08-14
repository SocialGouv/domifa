import { IsOptional, IsNotEmpty, IsDate, IsDateString } from "class-validator";

export class StatsDto {
  @IsDateString()
  @IsNotEmpty()
  public start!: string;

  @IsDateString()
  @IsOptional()
  public end!: string;
}
