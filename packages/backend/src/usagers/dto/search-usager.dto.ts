import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import {
  LowerCaseTransform,
  StripTagsTransform,
  Trim,
} from "../../_common/decorators";
import {
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
} from "@domifa/common";

export class SearchUsagerDto {
  @ApiProperty({
    example: "dupuis",
    description: "Nom ou prénom",
  })
  @IsOptional()
  @IsString()
  @Trim()
  @MinLength(2)
  @StripTagsTransform()
  @LowerCaseTransform()
  public searchString!: string;

  @IsOptional()
  @IsIn(["DEFAULT", "DATE_NAISSANCE"])
  public readonly searchStringField: "DEFAULT" | "DATE_NAISSANCE";

  @IsIn([
    "EXCEEDED",
    "NEXT_TWO_WEEKS",
    "NEXT_TWO_MONTHS",
    "PREVIOUS_YEAR",
    "PREVIOUS_TWO_YEARS",
  ])
  @IsOptional()
  public readonly echeance: UsagersFilterCriteriaEcheance;

  @IsIn(["PREVIOUS_TWO_MONTHS", "PREVIOUS_THREE_MONTHS"])
  @IsOptional()
  public readonly lastInteractionDate: UsagersFilterCriteriaDernierPassage;
}
