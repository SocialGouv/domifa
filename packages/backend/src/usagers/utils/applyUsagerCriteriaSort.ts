import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export type UsagerSortKey = "NOM" | "PASSAGE" | "ECHEANCE" | "RDV" | "ID";

// Échéance affichée, telle que `getDecisionDeadline()` la calcule côté
// application. Transposée ici parce qu'elle sert de clé de tri et n'existe
// nulle part en base.
//
// Le dernier cas remonte à l'avant-dernière décision pour un dossier en
// attente de décision, et à la dernière sinon — d'où l'indice négatif, et la
// garde sur la longueur du tableau que fait aussi la fonction d'origine.
const DECISION_DEADLINE_SQL = `
  CASE
    WHEN decision->>'statut' = 'VALIDE' AND decision->>'dateFin' IS NOT NULL
      THEN (decision->>'dateFin')::timestamptz
    WHEN decision->>'statut' IN ('RADIE', 'REFUS')
      THEN COALESCE(
        (decision->>'dateDebut')::timestamptz,
        (decision->>'dateFin')::timestamptz
      )
    WHEN "typeDom" = 'RENOUVELLEMENT'
      THEN CASE
        WHEN jsonb_array_length(COALESCE(historique, '[]'::jsonb))
             >= (CASE WHEN decision->>'statut' = 'ATTENTE_DECISION' THEN 2 ELSE 1 END)
          THEN COALESCE(
            (historique -> (CASE WHEN decision->>'statut' = 'ATTENTE_DECISION'
                                 THEN -2 ELSE -1 END) ->> 'dateFin')::timestamptz,
            (decision->>'dateDecision')::timestamptz
          )
        ELSE NULL
      END
    ELSE NULL
  END`;

// Référence affichée : la personnalisée si elle existe, sinon l'interne. Le tri
// applicatif place les références purement numériques avant les autres et les
// compare comme des nombres, le reste alphabétiquement.
const DISPLAY_REF_SQL = `COALESCE(NULLIF(TRIM("customRef"), ''), ref::text)`;
const IS_NUMERIC_REF_SQL = `(${DISPLAY_REF_SQL} ~ '^[0-9]+$')`;

// `compareAttributes` place les valeurs absentes en premier en ordre croissant
// et en dernier en ordre décroissant. Postgres fait exactement l'inverse par
// défaut (ASC NULLS LAST, DESC NULLS FIRST) : sans ces surcharges, tout tri sur
// une colonne nullable diverge de ce que voit l'utilisateur.
export function applyUsagerCriteriaSort<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  sortKey: UsagerSortKey,
  sortValue: "asc" | "desc"
): SelectQueryBuilder<T> {
  const ascending = sortValue !== "desc";
  const direction: "ASC" | "DESC" = ascending ? "ASC" : "DESC";
  const nulls: "NULLS FIRST" | "NULLS LAST" = ascending
    ? "NULLS FIRST"
    : "NULLS LAST";

  const orderBy = (expression: string) =>
    query.addOrderBy(expression, direction, nulls);

  if (sortKey === "ID") {
    // Le tri applicatif compare d'abord un booléen « est numérique » : en
    // ordre croissant les numériques passent devant, d'où la négation.
    orderBy(`(NOT ${IS_NUMERIC_REF_SQL})`);
    orderBy(
      `CASE WHEN ${IS_NUMERIC_REF_SQL} THEN (${DISPLAY_REF_SQL})::numeric END`
    );
    orderBy(`CASE WHEN NOT ${IS_NUMERIC_REF_SQL} THEN ${DISPLAY_REF_SQL} END`);
    return query;
  }

  if (sortKey === "PASSAGE") {
    orderBy(`("lastInteraction"->>'dateInteraction')::timestamptz`);
  } else if (sortKey === "RDV") {
    // Écart assumé avec le trieur applicatif, qui n'est pas transposable : il
    // ne place la date dans la comparaison que si elle existe, si bien qu'un
    // dossier sans rendez-vous y compare son NOM à la représentation texte
    // d'une date JavaScript. L'ordre obtenu dépend alors de la locale et du
    // fuseau, et un nom commençant par « Z » passe devant ou derrière les
    // dossiers datés selon le jour de la semaine de leur rendez-vous.
    // Les dossiers sans rendez-vous sont donc traités ici comme toute autre
    // valeur absente, à l'identique des autres tris.
    orderBy(`(rdv->>'dateRdv')::date`);
  } else if (sortKey === "ECHEANCE") {
    orderBy(`(${DECISION_DEADLINE_SQL})`);
  }

  // Départages, dans l'ordre du tri applicatif, et dans le même sens que la
  // clé principale : le comparateur applique `asc` à tous les attributs.
  orderBy(`LOWER(COALESCE(nom, ''))`);
  orderBy(`LOWER(COALESCE(prenom, ''))`);
  orderBy(`ref`);

  return query;
}
