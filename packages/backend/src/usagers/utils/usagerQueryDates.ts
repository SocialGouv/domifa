import { TimeZone } from "@domifa/common";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { getUsagerDeadlines } from "@domifa/common";

// La notion de « jour » des filtres est celle de la structure : c'est le fuseau
// que porte `StructureTable.timeZone` et qu'utilisent déjà les crons SMS pour
// calculer les fins de domiciliation. Le navigateur, lui, travaille dans le
// fuseau de la machine de l'agent — en pratique celui de la structure.
//
// Deux pièges que ces helpers neutralisent :
// - `CURRENT_DATE` et `x::date` dépendent du GUC `timezone` de la SESSION
//   PostgreSQL, que l'application ne fixe jamais (node-postgres ne transmet pas
//   `TZ` au serveur). Tout passe donc par `AT TIME ZONE` explicite.
// - le fuseau est interpolé dans le SQL (pas un paramètre lié) : il est
//   verrouillé sur la liste fermée des fuseaux du produit.

// Miroir exhaustif du type `TimeZone` : `Record<TimeZone, true>` casse la
// compilation si le type et cette liste divergent, dans les deux sens.
export const SUPPORTED_TIME_ZONES: Record<TimeZone, true> = {
  "America/Guadeloupe": true,
  "America/Martinique": true,
  "America/Cayenne": true,
  "Indian/Reunion": true,
  "Indian/Mayotte": true,
  "Europe/Paris": true,
  "Pacific/Noumea": true,
  "Pacific/Tahiti": true,
  "Pacific/Wallis": true,
  "America/Miquelon": true,
  "Indian/Maldives": true,
};

export const assertSupportedTimeZone = (timeZone: string): TimeZone => {
  if (!(timeZone in SUPPORTED_TIME_ZONES)) {
    throw new Error(
      `Unsupported time zone "${timeZone}": expected one of ${Object.keys(
        SUPPORTED_TIME_ZONES
      ).join(", ")}`
    );
  }
  return timeZone as TimeZone;
};

// Date calendaire d'un horodatage, vue depuis le fuseau de la structure.
// Note : une valeur SANS indication de fuseau (date seule, timestamp naïf)
// serait interprétée dans le fuseau de session avant conversion — les dates de
// l'application sont toujours stockées en ISO horodaté UTC (`toISOString`).
export const localDateSql = (
  expression: string,
  timeZone: TimeZone
): string => {
  assertSupportedTimeZone(timeZone);
  return `((${expression})::timestamptz AT TIME ZONE '${timeZone}')::date`;
};

// « Aujourd'hui » dans le fuseau de la structure — PAS `CURRENT_DATE`, qui est
// la date dans le fuseau de session PostgreSQL. L'instant de référence est
// injectable : c'est ce qui permet de prouver le prédicat sur des instants
// FIXES, discriminants par construction, au lieu de dépendre de l'heure
// d'exécution du test.
export const localTodaySql = (
  timeZone: TimeZone,
  nowSql = "now()"
): string => {
  assertSupportedTimeZone(timeZone);
  return `((${nowSql} AT TIME ZONE '${timeZone}')::date)`;
};

// Échéances glissantes calculées comme le navigateur les calcule : arithmétique
// de calendrier mural (`endOfDay`, `subMonths`…) dans le fuseau de l'agent,
// puis retour à l'instant absolu. Même construction que
// `generateScheduleSendDate` côté SMS.
export const getZonedUsagerDeadlines = (
  timeZone: TimeZone
): ReturnType<typeof getUsagerDeadlines> => {
  assertSupportedTimeZone(timeZone);
  const zonedNow = utcToZonedTime(new Date(), timeZone);
  const deadlines = getUsagerDeadlines(zonedNow);

  return Object.fromEntries(
    Object.entries(deadlines).map(([key, timing]) => [
      key,
      { ...timing, value: zonedTimeToUtc(timing.value, timeZone) },
    ])
  ) as ReturnType<typeof getUsagerDeadlines>;
};
