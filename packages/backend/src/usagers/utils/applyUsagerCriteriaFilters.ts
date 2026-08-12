import {
  ETAPE_ENTRETIEN,
  TimeZone,
  UsagersFilterCriteriaStatut,
} from "@domifa/common";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import {
  getZonedUsagerDeadlines,
  localDateSql,
  localTodaySql,
} from "./usagerQueryDates";

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
// Les dates sont stockées en texte ISO, souvent horodatées. `x::date` en tire
// la date du fuseau de SESSION PostgreSQL, pas celle de l'utilisateur : une
// décision expirant à 00h30 à Paris était classée la veille. Toutes les
// comparaisons de jour passent donc par le fuseau de la STRUCTURE
// (`structure.timeZone`), le même que le navigateur de l'agent en pratique —
// DomiFa sert aussi des structures ultramarines, jusqu'à 11 h d'écart avec
// Paris. Voir `usagerQueryDates.ts`.
//
// Le navigateur mélange aujourd'hui deux conventions — la date UTC pour
// l'entretien, les jours calendaires locaux pour l'échéance — ce qui les fait
// diverger entre elles autour de minuit. On aligne les deux sur la date
// locale de la structure, la seule qui corresponde à ce qu'un utilisateur
// appelle « aujourd'hui ».
//
// Ces filtres ne cloisonnent PAS par structure : l'appelant doit poser
// `structureId` lui-même (comme le fait la suite différentielle), sans quoi
// la requête mélange les dossiers de toutes les structures.
//
// À noter, l'endpoint `search-radies` traduisait déjà deux de ces filtres,
// mais différemment du navigateur : il testait `decision->>'dateDecision'`
// quand le checker teste `decision.dateFin`, et il comparait le dernier
// passage dans le sens inverse. Ces écarts ne sont pas reconduits ici.
export function applyUsagerCriteriaFilters<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  filters: UsagerCriteriaFilters,
  timeZone: TimeZone
): SelectQueryBuilder<T> {
  const today = localTodaySql(timeZone);

  if (filters.statut && filters.statut !== UsagersFilterCriteriaStatut.TOUS) {
    query.andWhere(`usager.statut = :statut`, { statut: filters.statut });
  }

  if (typeof filters.referrerId !== "undefined") {
    query.andWhere(
      filters.referrerId === null
        ? `usager."referrerId" IS NULL`
        : `usager."referrerId" = :referrerId`,
      { referrerId: filters.referrerId }
    );
  }

  if (filters.entretien) {
    // Le checker écarte d'emblée les dossiers sans rendez-vous ou déjà
    // au-delà de l'étape d'entretien.
    query.andWhere(
      `usager.rdv->>'dateRdv' IS NOT NULL
       AND usager."etapeDemande" <= :etapeEntretien
       AND ${localDateSql("usager.rdv->>'dateRdv'", timeZone)} ${
        filters.entretien === "COMING" ? ">" : "<"
      } ${today}`,
      { etapeEntretien: ETAPE_ENTRETIEN }
    );
  }

  if (filters.interactionType === "courrierIn") {
    query.andWhere(
      `(usager."lastInteraction"->>'enAttente')::boolean IS TRUE`
    );
  }

  if (filters.echeance) {
    // Le checker renvoie false dès que `dateFin` manque, quel que soit le
    // seuil demandé.
    query.andWhere(`usager.decision->>'dateFin' IS NOT NULL`);

    const dateFin = localDateSql("usager.decision->>'dateFin'", timeZone);

    if (filters.echeance === "EXCEEDED") {
      query.andWhere(`${dateFin} < ${today}`);
    } else if (filters.echeance === "NEXT_TWO_WEEKS") {
      query.andWhere(`${dateFin} >= ${today} AND ${dateFin} < ${today} + 16`);
    } else if (filters.echeance === "NEXT_TWO_MONTHS") {
      query.andWhere(`${dateFin} >= ${today} AND ${dateFin} < ${today} + 61`);
    } else if (filters.echeance.startsWith("PREVIOUS_")) {
      const deadline = getZonedUsagerDeadlines(timeZone)[filters.echeance];
      if (deadline) {
        query.andWhere(
          `(usager.decision->>'dateFin')::timestamptz < :echeanceDeadline`,
          { echeanceDeadline: deadline.value }
        );
      } else {
        // Valeur inconnue : le checker crashe, le DTO la refuse en amont —
        // ici on rend l'ensemble vide plutôt qu'une 500 sur un paramètre.
        query.andWhere("1 = 0");
      }
    } else {
      // Le checker retourne false sur une valeur qu'il ne connaît pas.
      query.andWhere("1 = 0");
    }
  }

  if (filters.lastInteractionDate) {
    const deadline = getZonedUsagerDeadlines(timeZone)[
      filters.lastInteractionDate
    ];

    query.andWhere(`usager."lastInteraction"->>'dateInteraction' IS NOT NULL`);

    if (deadline) {
      // Sens du checker : on cherche les dossiers PAS revus depuis l'échéance.
      query.andWhere(
        `(usager."lastInteraction"->>'dateInteraction')::timestamptz < :passageDeadline`,
        { passageDeadline: deadline.value }
      );
    }
  }

  return query;
}
