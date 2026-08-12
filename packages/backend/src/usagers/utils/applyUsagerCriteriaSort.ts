import { TimeZone } from "@domifa/common";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { localDateSql } from "./usagerQueryDates";

export type UsagerSortKey = "NOM" | "PASSAGE" | "ECHEANCE" | "RDV" | "ID";

// Échéance affichée, telle que `getDecisionDeadline()` la calcule côté
// application. Transposée ici parce qu'elle sert de clé de tri et n'existe
// nulle part en base. Exportée pour que la suite différentielle compare sa
// valeur, ligne à ligne, à celle de la fonction d'origine.
//
// La première branche reprend la garde d'entrée de la fonction : une décision
// sans aucune date n'affiche pas d'échéance. Un dossier RADIE/REFUS dont seule
// `dateDecision` est posée passe cette garde mais n'a ni `dateDebut` ni
// `dateFin` : la fonction d'origine y produit un `Invalid Date`, ici NULL —
// écart assumé, du même ordre que le tri par rendez-vous.
//
// Le dernier cas remonte à l'avant-dernière décision pour un dossier en
// attente de décision, et à la dernière sinon — d'où l'indice négatif, et la
// garde sur la longueur du tableau que fait aussi la fonction d'origine.
export const DECISION_DEADLINE_SQL = `
  CASE
    WHEN usager.decision->>'dateDebut' IS NULL
         AND usager.decision->>'dateFin' IS NULL
         AND usager.decision->>'dateDecision' IS NULL
      THEN NULL
    WHEN usager.decision->>'statut' = 'VALIDE' AND usager.decision->>'dateFin' IS NOT NULL
      THEN (usager.decision->>'dateFin')::timestamptz
    WHEN usager.decision->>'statut' IN ('RADIE', 'REFUS')
      THEN COALESCE(
        (usager.decision->>'dateDebut')::timestamptz,
        (usager.decision->>'dateFin')::timestamptz
      )
    WHEN usager."typeDom" = 'RENOUVELLEMENT'
      THEN CASE
        WHEN jsonb_array_length(COALESCE(usager.historique, '[]'::jsonb))
             >= (CASE WHEN usager.decision->>'statut' = 'ATTENTE_DECISION' THEN 2 ELSE 1 END)
          THEN COALESCE(
            (usager.historique -> (CASE WHEN usager.decision->>'statut' = 'ATTENTE_DECISION'
                                 THEN -2 ELSE -1 END) ->> 'dateFin')::timestamptz,
            (usager.decision->>'dateDecision')::timestamptz
          )
        ELSE NULL
      END
    ELSE NULL
  END`;

// Référence affichée : la personnalisée si elle existe, sinon l'interne. Le tri
// applicatif place les références purement numériques avant les autres et les
// compare comme des nombres, le reste alphabétiquement.
// `localeCompare` classe l'espace et l'apostrophe au niveau primaire : « Le Gall »
// passe avant « Leblanc », « O'Brien » avant « Oberkampf ». Les collations
// système (en_US.utf8, C) les ignorent ou rejettent les accents après Z, et rien
// ne garantit celle de la base. On épingle donc une collation ICU française, qui
// reproduit l'ordre affiché aujourd'hui.
//
// Requiert un Postgres compilé avec ICU — le cas de l'image utilisée et des
// offres managées récentes.
const NAME_COLLATION = `COLLATE "fr-x-icu"`;

const DISPLAY_REF_SQL = `COALESCE(NULLIF(TRIM(usager."customRef"), ''), usager.ref::text)`;
const IS_NUMERIC_REF_SQL = `(${DISPLAY_REF_SQL} ~ '^[0-9]+$')`;

// `compareAttributes` place les valeurs absentes en premier en ordre croissant
// et en dernier en ordre décroissant. Postgres fait exactement l'inverse par
// défaut (ASC NULLS LAST, DESC NULLS FIRST) : sans ces surcharges, tout tri sur
// une colonne nullable diverge de ce que voit l'utilisateur.
export function applyUsagerCriteriaSort<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  sortKey: UsagerSortKey,
  sortValue: "asc" | "desc",
  timeZone: TimeZone
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
    orderBy(
      `CASE WHEN NOT ${IS_NUMERIC_REF_SQL} THEN ${DISPLAY_REF_SQL} END ${NAME_COLLATION}`
    );
    // Rien n'interdit deux références affichées identiques (les doublons de
    // `customRef` ne sont que signalés à l'IHM) : sans départage unique,
    // l'ordre dépend de l'emplacement physique des lignes et une pagination
    // peut montrer un dossier deux fois et un autre jamais.
    orderBy(`usager.ref`);
    return query;
  }

  if (sortKey === "PASSAGE") {
    orderBy(`(usager."lastInteraction"->>'dateInteraction')::timestamptz`);
  } else if (sortKey === "RDV") {
    // Écart assumé avec le trieur applicatif, qui n'est pas transposable : il
    // ne place la date dans la comparaison que si elle existe, si bien qu'un
    // dossier sans rendez-vous y compare son NOM à la représentation texte
    // d'une date JavaScript. L'ordre obtenu dépend alors de la locale et du
    // fuseau, et un nom commençant par « Z » passe devant ou derrière les
    // dossiers datés selon le jour de la semaine de leur rendez-vous.
    // Les dossiers sans rendez-vous sont donc traités ici comme toute autre
    // valeur absente, à l'identique des autres tris.
    orderBy(localDateSql("usager.rdv->>'dateRdv'", timeZone));
  } else if (sortKey === "ECHEANCE") {
    orderBy(`(${DECISION_DEADLINE_SQL})`);
  }

  // Départages, dans l'ordre du tri applicatif, et dans le même sens que la
  // clé principale : le comparateur applique `asc` à tous les attributs.
  orderBy(`LOWER(COALESCE(usager.nom, '')) ${NAME_COLLATION}`);
  orderBy(`LOWER(COALESCE(usager.prenom, '')) ${NAME_COLLATION}`);
  orderBy(`usager.ref`);

  return query;
}
