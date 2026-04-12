import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
  ValidateIf,
  IsIn,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  RegistrationSources,
  CurrentTool,
  MarketTool,
  CURRENT_TOOL_VALUES,
  MARKET_TOOL_VALUES,
  REGISTRATION_SOURCES_VALUES,
} from "@domifa/common";
export class StructureRegistrationDto {
  @ApiProperty({
    description: "Source d'inscription de la structure",
    example: "PROSPECTION_DIRECTE",
  })
  @IsIn(REGISTRATION_SOURCES_VALUES)
  source: RegistrationSources;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  sourceDetail?: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  activeUsersCount: number;

  @ValidateIf((obj) => obj.structureType === "asso")
  @IsBoolean()
  dsp?: boolean;

  @IsIn(CURRENT_TOOL_VALUES)
  currentTool: CurrentTool;

  @ValidateIf((obj) => obj.currentTool === "OUTIL_MARCHE")
  @IsIn(MARKET_TOOL_VALUES)
  marketTool?: MarketTool;

  @ValidateIf(
    (obj) => obj.currentTool === "OUTIL_MARCHE" && obj.marketTool === "AUTRE"
  )
  @IsString()
  @MaxLength(200)
  marketToolOther?: string;
}
