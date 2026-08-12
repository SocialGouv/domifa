import { BadRequestException } from "@nestjs/common";
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

const MAX_SEARCH_STRING_LENGTH = 200;

export class SearchUsagerDto {
  @ApiProperty({
    example: "dupuis",
    description: "Nom ou prénom",
  })
  @Transform(({ value, obj }) => {
    if (!value) {
      return null;
    }

    // La borne porte sur la saisie BRUTE, ici et pas en décorateur : après
    // transformation, une saisie vide vaut `null` — qu'un `@MaxLength`
    // rejetterait, alors que la liste des radiés s'amorce précisément sans
    // critère. Sans borne, la recherche par mots (un ILIKE par mot) coûtait
    // plus de 20 s de CPU Postgres et ~100 ms de boucle d'événements bloquée
    // sur un corps de 100 ko. Aucune saisie légitime n'approche 200
    // caractères. Le contrôle de type évite au passage un 500 (`normalize`
    // sur un non-string).
    if (typeof value !== "string") {
      throw new BadRequestException(
        "La recherche doit être une chaîne de caractères"
      );
    }
    if (value.length > MAX_SEARCH_STRING_LENGTH) {
      throw new BadRequestException(
        `La recherche est limitée à ${MAX_SEARCH_STRING_LENGTH} caractères`
      );
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
