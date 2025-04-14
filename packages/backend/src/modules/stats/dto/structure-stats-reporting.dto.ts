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
  @Max(1000)
  workers: number | null;

  @IsNumber()
  @Min(0)
  @Max(10000)
  volunteers: number | null;

  @IsNumber()
  @Max(1000000)
  @Min(0)
  humanCosts: number | null;

  @IsNumber()
  @Max(1000000)
  @Min(0)
  totalCosts: number | null;

  @IsNumber()
  @Min(new Date().getFullYear() - 5) // 5 years ago
  @Max(new Date().getFullYear()) // current year
  year: number;
}
