import {
  subMonths,
  addMonths,
  subYears,
  addWeeks,
  endOfDay,
  subDays,
} from "date-fns";
import { TimingsConfig, Timings } from "../types/Timings.type";

export function getUsagerDeadlines(refDate: Date = new Date()): TimingsConfig {
  return {
    PREVIOUS_TWO_MONTHS: {
      label: "Depuis plus de 2 mois",
      value: subDays(endOfDay(subMonths(refDate, 2)), 1),
    },
    PREVIOUS_THREE_MONTHS: {
      label: "Depuis plus de 3 mois",
      value: subDays(endOfDay(subMonths(refDate, 3)), 1),
    },
    PREVIOUS_TWO_YEARS: {
      label: "Depuis plus de 2 ans",
      value: subDays(endOfDay(subYears(refDate, 2)), 1),
    },
    PREVIOUS_YEAR: {
      label: "Depuis plus d'un an",
      value: subDays(endOfDay(subYears(refDate, 1)), 1),
    },
    NEXT_TWO_MONTHS: {
      label: "Dans moins de 2 mois",
      value: endOfDay(addMonths(refDate, 2)),
    },
    NEXT_TWO_WEEKS: {
      label: "Dans moins de 2 semaines",
      value: endOfDay(addWeeks(refDate, 2)),
    },
    EXCEEDED: {
      label: "Échéance dépassée",
      value: endOfDay(refDate),
    },
  };
}

export const extractDeadlines = <T extends Timings>(
  keys: T[],
  refDate: Date = new Date()
): { [K in T]: TimingsConfig[K] } => {
  const currentDeadlines = getUsagerDeadlines(refDate);

  return keys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: currentDeadlines[key],
    };
  }, {} as { [K in T]: TimingsConfig[K] });
};
