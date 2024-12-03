import { subMonths, addMonths, subYears, addWeeks } from "date-fns";
import { TimingsConfig, Timings } from "./types/Timings.type";

export function getUsagerDeadlines(refDate: Date = new Date()): TimingsConfig {
  return {
    PREVIOUS_TWO_MONTHS: {
      label: "Depuis plus de 2 mois",
      value: subMonths(refDate, 2),
    },
    PREVIOUS_THREE_MONTHS: {
      label: "Depuis plus de 3 mois",
      value: subMonths(refDate, 3),
    },
    PREVIOUS_TWO_YEARS: {
      label: "Depuis plus de 2 ans",
      value: subYears(refDate, 2),
    },
    PREVIOUS_YEAR: {
      label: "Depuis plus d'un an",
      value: subYears(refDate, 1),
    },
    NEXT_TWO_MONTHS: {
      label: "Dans moins de 2 mois",
      value: addMonths(refDate, 2),
    },
    NEXT_TWO_WEEKS: {
      label: "Dans moins de 2 semaines",
      value: addWeeks(refDate, 2),
    },
    EXCEEDED: {
      label: "Échéance dépassée",
      value: refDate,
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
