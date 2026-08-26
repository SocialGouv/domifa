import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Transform } from "class-transformer";
import {
  RegistrationSources,
  CurrentTool,
  MarketTool,
  CURRENT_TOOL_VALUES,
  MARKET_TOOL_VALUES,
  REGISTRATION_SOURCES_VALUES,
  SOURCES_OPTIONS,
} from "@domifa/common";
import {
  StripTagsTransform,
  ValidateIfElseNull,
} from "../../../_common/decorators";
export class StructureRegistrationDto {
  @IsIn(REGISTRATION_SOURCES_VALUES)
  source: RegistrationSources;

  @ValidateIfElseNull(
    (obj) =>
      SOURCES_OPTIONS.find((o) => o.value === obj.source)?.requiresDetail ===
      true
  )
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  @StripTagsTransform()
  sourceDetail?: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  activeUsersCount: number;

  @IsOptional()
  @IsBoolean()
  dsp?: boolean;

  @IsIn(CURRENT_TOOL_VALUES)
  currentTool: CurrentTool;

  @ValidateIfElseNull((obj) => obj.currentTool === "OUTIL_MARCHE")
  @IsNotEmpty()
  @IsIn(MARKET_TOOL_VALUES)
  marketTool?: MarketTool;

  @ValidateIfElseNull(
    (obj) => obj.currentTool === "OUTIL_MARCHE" && obj.marketTool === "AUTRE"
  )
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @StripTagsTransform()
  marketToolOther?: string;
}
