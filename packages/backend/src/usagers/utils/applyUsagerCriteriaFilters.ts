import {
  ETAPE_ENTRETIEN,
  getUsagerDeadlines,
  UsagersFilterCriteriaStatut,
} from "@domifa/common";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

// Les dates sont stockées en texte ISO, souvent horodatées. `x::date` en tire
// la date UTC, pas la date locale : une décision expirant à 00h30 à Paris était
// classée la veille. Toutes les comparaisons de jour passent donc par le fuseau
// de l'application.
//
// Le navigateur mélange aujourd'hui deux conventions — la date UTC pour
// l'entretien, les jours calendaires locaux pour l'échéance — ce qui les fait
// diverger entre elles deux heures par jour. On aligne les deux sur la date
// locale, la seule qui corresponde à ce qu'un utilisateur appelle « aujourd'hui ».
const APP_TIME_ZONE = "Europe/Paris";
const localDate = (expression: string): string =>
  `((${expression})::timestamptz AT TIME ZONE '${APP_TIME_ZONE}')::date`;

export type UsagerCriteriaFilters = {
  statut?: string | null;
  echeance?: string | null;
  interactionType?: "courrierIn" | null;
  lastInteractionDate?: string | null;
  entretien?: "COMING" | "PASSED" | null;
  referrerId?: number | null;
};

// Traduction SQL des filtres de la liste des usagers.
//
// La référence est l'implémentation du navigateur (`usagersFilter.service.ts`
// et ses checkers) : c'est le comportement que les utilisateurs constatent
// aujourd'hui, donc le seul qui fasse foi pour juger d'une régression.
//
// À noter, l'endpoint `search-radies` traduisait déjà deux de ces filtres,
// mais différemment du navigateur : il testait `decision->>'dateDecision'`
// quand le checker teste `decision.dateFin`, et il comparait le dernier
// passage dans le sens inverse. Ces écarts ne sont pas reconduits ici.
export function applyUsagerCriteriaFilters<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  filters: UsagerCriteriaFilters
): SelectQueryBuilder<T> {
  if (filters.statut && filters.statut !== UsagersFilterCriteriaStatut.TOUS) {
    query.andWhere(`statut = :statut`, { statut: filters.statut });
  }

  if (typeof filters.referrerId !== "undefined") {
    query.andWhere(
      filters.referrerId === null
        ? `"referrerId" IS NULL`
        : `"referrerId" = :referrerId`,
      { referrerId: filters.referrerId }
    );
  }

  if (filters.entretien) {
    // Le checker écarte d'emblée les dossiers sans rendez-vous ou déjà
    // au-delà de l'étape d'entretien.
    query.andWhere(
      `rdv->>'dateRdv' IS NOT NULL
       AND "etapeDemande" <= :etapeEntretien
       AND ${localDate("rdv->>'dateRdv'")} ${
        filters.entretien === "COMING" ? ">" : "<"
      } CURRENT_DATE`,
      { etapeEntretien: ETAPE_ENTRETIEN }
    );
  }

  if (filters.interactionType === "courrierIn") {
    query.andWhere(`("lastInteraction"->>'enAttente')::boolean IS TRUE`);
  }

  if (filters.echeance) {
    // Le checker renvoie false dès que `dateFin` manque, quel que soit le
    // seuil demandé.
    query.andWhere(`decision->>'dateFin' IS NOT NULL`);

    if (filters.echeance === "EXCEEDED") {
      query.andWhere(`${localDate("decision->>'dateFin'")} < CURRENT_DATE`);
    } else if (filters.echeance === "NEXT_TWO_WEEKS") {
      query.andWhere(
        `${localDate("decision->>'dateFin'")} >= CURRENT_DATE
         AND ${localDate("decision->>'dateFin'")} < CURRENT_DATE + 16`
      );
    } else if (filters.echeance === "NEXT_TWO_MONTHS") {
      query.andWhere(
        `${localDate("decision->>'dateFin'")} >= CURRENT_DATE
         AND ${localDate("decision->>'dateFin'")} < CURRENT_DATE + 61`
      );
    } else if (filters.echeance.startsWith("PREVIOUS_")) {
      const deadline = getUsagerDeadlines()[filters.echeance];
      query.andWhere(
        `(decision->>'dateFin')::timestamptz < :echeanceDeadline`,
        { echeanceDeadline: deadline.value }
      );
    } else {
      // Le checker retourne false sur une valeur qu'il ne connaît pas.
      query.andWhere("1 = 0");
    }
  }

  if (filters.lastInteractionDate) {
    const deadline = getUsagerDeadlines()[filters.lastInteractionDate];

    query.andWhere(`"lastInteraction"->>'dateInteraction' IS NOT NULL`);

    if (deadline) {
      // Sens du checker : on cherche les dossiers PAS revus depuis l'échéance.
      query.andWhere(
        `("lastInteraction"->>'dateInteraction')::timestamptz < :passageDeadline`,
        { passageDeadline: deadline.value }
      );
    }
  }

  return query;
}
