import { StructureWaitingTime } from "@domifa/common";
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";

export class StructureStatsReportingDto {
  @IsOptional()
  @IsBoolean()
  waitingList: boolean | null;

  @IsOptional()
  @IsIn(Object.values(StructureWaitingTime))
  waitingTime: StructureWaitingTime | null;

  @IsNumber()
  @IsOptional()
  workers: number | null;

  @IsNumber()
  volunteers: number | null;

  @IsNumber()
  humanCosts: number | null;

  @IsNumber()
  totalCosts: number | null;

  @IsNumber()
  @Min(2020)
  @Max(2035)
  year: number;
}
