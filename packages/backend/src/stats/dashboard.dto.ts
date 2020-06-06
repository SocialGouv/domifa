import { IsIn, IsNumber, IsOptional } from "class-validator";

export class DashboardDto {
  @IsIn([
    "region",
    "createdAt",
    "importDate",
    "lastLogin",
    "structureType",
    "import",
  ])
  public sort!: string;

  @IsIn(["asc", "desc"])
  public value!: string;
}
