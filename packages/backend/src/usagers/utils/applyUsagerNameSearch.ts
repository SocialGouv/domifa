import { buildWords } from "@domifa/common";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

// Same rule as the frontend search: every word must be present, in any order
export function applyUsagerNameSearch<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  searchString: string
): SelectQueryBuilder<T> {
  buildWords(searchString).forEach((word, index) => {
    const parameter = `searchWord${index}`;
    query.andWhere(`usager.nom_prenom_surnom_ref ILIKE :${parameter}`, {
      [parameter]: `%${word}%`,
    });
  });
  return query;
}
