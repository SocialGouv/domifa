import { format } from "date-fns";

export function buildExportStructureStatsFileName({
  startDateUTC,
  endDateUTC,
  structureId,
}: {
  startDateUTC: Date;
  endDateUTC: Date | null;
  structureId: number;
}): string {
  return endDateUTC
    ? `${format(startDateUTC, "yyyy-MM-dd")}_${format(
        endDateUTC,
        "yyyy-MM-dd"
      )}_export-structure-${structureId}-stats.xlsx`
    : `${format(
        startDateUTC,
        "yyyy-MM-dd"
      )}_export-structure-${structureId}-stats.xlsx`;
}
