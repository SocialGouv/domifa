import { CriteriaSearchField, normalizeString } from "@domifa/common";
import { BadRequestException } from "@nestjs/common";
import { isValid, parse } from "date-fns";

export function validateSearchField(
  value: string,
  searchField: CriteriaSearchField
): boolean {
  if (!value || !searchField) {
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

      case CriteriaSearchField.PHONE_NUMBER:
        const cleanPhone = value.replace(/\D/g, "");
        if (cleanPhone.length === 0) {
          throw new BadRequestException(
            "Le numéro de téléphone doit contenir au moins un chiffre"
          );
        }
        return true;

      default:
        const cleanText = normalizeString(value).trim();
        if (cleanText.length === 0) {
          throw new BadRequestException(
            "Le texte de recherche doit contenir au moins un caractère"
          );
        }
        return true;
    }
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    return false;
  }
}
