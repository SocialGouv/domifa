import {
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
  STRUCTURE_TYPE_MAP,
  StructureType,
} from "@domifa/common";
import { StrictIntTransform } from "../../../_common/decorators";
import {
  IsIn,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class MetabaseStatsDto {
  @IsNotEmpty()
  @IsInt()
  @StrictIntTransform()
  @Min(2020)
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
  @IsInt()
  @Min(1)
  @StrictIntTransform()
  structureId?: number;

  @IsOptional()
  @IsIn(STRUCTURE_TYPE_MAP)
  structureType?: StructureType;
}
