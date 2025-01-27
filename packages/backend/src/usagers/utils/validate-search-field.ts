import { CriteriaSearchField } from "@domifa/common";
import { BadRequestException } from "@nestjs/common";
import { isValid, parse } from "date-fns";

export function validateSearchField(
  value: string,
  searchField: CriteriaSearchField
): boolean {
  if (!searchField) {
    return false;
  }

  try {
    switch (searchField) {
      case CriteriaSearchField.BIRTH_DATE:
        const cleanDate = value.replace(/\D/g, "");
        if (cleanDate.length !== 8) {
          throw new BadRequestException(
            'Format de date invalide. La date doit être au format "jj/mm/aaaa"'
          );
        }

        const parsedDate = parse(cleanDate, "ddMMyyyy", new Date());
        if (!isValid(parsedDate)) {
          throw new BadRequestException(
            "Date invalide. Vérifiez que le jour et le mois sont corrects"
          );
        }
        return true;
      default:
        return true;
    }
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    return false;
  }
}
