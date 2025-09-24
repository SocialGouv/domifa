import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, ValidateIf } from "class-validator";
import {
  CriteriaSearchField,
  normalizeString,
  parseBirthDate,
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
  UsagersFilterCriteriaEntretien,
} from "@domifa/common";
import { Transform } from "class-transformer";
import { ValidateSearchField } from "../decorators";

export class SearchUsagerDto {
  @ApiProperty({
    example: "dupuis",
    description: "Nom ou prénom",
  })
  @Transform(({ value, obj }) => {
    if (!value) {
      return null;
    }

    if (CriteriaSearchField.PHONE_NUMBER === obj.searchStringField) {
      return value.replace(/\D/g, "");
    } else if (CriteriaSearchField.BIRTH_DATE === obj.searchStringField) {
      return parseBirthDate(value);
    }

    return normalizeString(value).trim();
  })
  @ValidateIf((obj) => obj.searchStringField)
  @ValidateSearchField()
  public searchString!: string;

  @IsIn(Object.values(CriteriaSearchField))
  public readonly searchStringField: CriteriaSearchField;

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

  @IsIn(Object.values(UsagersFilterCriteriaEntretien))
  @IsOptional()
  public readonly entretien: UsagersFilterCriteriaEntretien;

  @IsNumber()
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  public readonly referrerId: number | null;
}
