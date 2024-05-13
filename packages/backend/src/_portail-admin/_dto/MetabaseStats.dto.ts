import {
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
  StructureType,
} from "@domifa/common";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class MetabaseStatsDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(2021)
  @Max(2048)
  year: number;

  @IsOptional()
  @IsString()
  @IsIn(Object.keys(REGIONS_LISTE))
  region?: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.keys(DEPARTEMENTS_LISTE))
  department?: string;

  @IsOptional()
  @IsNumberString()
  structureId?: number;

  @IsOptional()
  @IsIn(["asso", "ccas", "cias", "other"])
  structureType?: StructureType;
}
