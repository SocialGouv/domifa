import {
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
  STRUCTURE_TYPE_MAP,
  StructureType,
} from "@domifa/common";
import { Transform } from "class-transformer";
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
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
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
  @IsNumberString()
  structureId?: number;

  @IsOptional()
  @IsIn(STRUCTURE_TYPE_MAP)
  structureType?: StructureType;
}
