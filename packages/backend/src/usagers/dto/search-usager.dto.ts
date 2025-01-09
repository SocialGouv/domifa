import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import {
  LowerCaseTransform,
  StripTagsTransform,
} from "../../_common/decorators";
import {
  CriteriaSearchField,
  normalizeString,
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
} from "@domifa/common";
import { Transform } from "class-transformer";
import { isValid, parse } from "date-fns";
import { BadRequestException } from "@nestjs/common";

export class SearchUsagerDto {
  @ApiProperty({
    example: "dupuis",
    description: "Nom ou prénom",
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @StripTagsTransform()
  @LowerCaseTransform()
  @Transform(({ value, obj }) => {
    if (!value) {
      return null;
    }

    switch (obj.searchStringField) {
      case CriteriaSearchField.PHONE_NUMBER:
        return value.replace(/\D/g, "");

      case CriteriaSearchField.BIRTH_DATE:
        const cleanDate = value.replace(/\D/g, "");
        const parsedDate = parse(cleanDate, "ddMMyyyy", new Date());

        if (!isValid(parsedDate)) {
          throw new BadRequestException(
            'Format de date invalide. Utilisez le format "dd/MM/yyyy"'
          );
        }
        return cleanDate;

      case CriteriaSearchField.DEFAULT:
      default:
        return normalizeString(value).trim();
    }
  })
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
}
