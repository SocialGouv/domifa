export type Timings =
  | "NEXT_TWO_WEEKS"
  | "PREVIOUS_TWO_MONTHS"
  | "PREVIOUS_THREE_MONTHS"
  | "NEXT_TWO_MONTHS"
  | "EXCEEDED"
  | "PREVIOUS_TWO_YEARS"
  | "PREVIOUS_YEAR";

export type UsagersFilterCriteriaEcheance = Extract<
  Timings,
  | "NEXT_TWO_WEEKS"
  | "NEXT_TWO_MONTHS"
  | "EXCEEDED"
  | "PREVIOUS_YEAR"
  | "PREVIOUS_TWO_YEARS"
>;

export type UsagersFilterCriteriaDernierPassage = Extract<
  Timings,
  "PREVIOUS_TWO_MONTHS" | "PREVIOUS_THREE_MONTHS"
>;
export type TimingsConfig = {
  [key in Timings]: {
    label: string;
    value: Date;
  };
};
