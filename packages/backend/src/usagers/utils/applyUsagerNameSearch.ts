import { buildWords } from "@domifa/common";
import { SelectQueryBuilder, ObjectLiteral } from "typeorm";

// Reproduit la recherche par nom de l'interface, qui exige que **tous** les
// mots saisis soient présents, dans n'importe quel ordre, accents et
// ponctuation ignorés.
//
// `buildWords` est la fonction employée par le navigateur : la découpe et la
// normalisation sont donc identiques des deux côtés, par construction et non
// par ressemblance. La colonne `nom_prenom_surnom_ref` stocke ces mêmes
// attributs normalisés et joints par des espaces ; comme un mot recherché ne
// contient jamais d'espace, le chercher dans la chaîne jointe équivaut
// exactement à le chercher dans chaque attribut pris séparément.
export function applyUsagerNameSearch<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  searchString: string
): SelectQueryBuilder<T> {
  const words = buildWords(searchString);

  words.forEach((word, index) => {
    const parameter = `searchWord${index}`;
    query.andWhere(`nom_prenom_surnom_ref ILIKE :${parameter}`, {
      [parameter]: `%${word}%`,
    });
  });

  return query;
}
