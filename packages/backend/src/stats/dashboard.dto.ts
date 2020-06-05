import { IsIn, IsNumber, IsOptional } from "class-validator";

export class DashboardDto {
  @IsOptional()
  @IsIn([
    "+region",
    "+createdAt",
    "+importDate",
    "+lastLogin",
    "+structureType",
    "+import",
    "-region",
    "-createdAt",
    "-importDate",
    "-lastLogin",
    "-structureType",
    "-import",
  ])
  public sort!: string;
}
