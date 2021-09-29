import { format } from "date-fns";

export function buildExportStructureStatsFileName({
  startDateUTC,
  endDateUTC,
  structureId,
}: {
  startDateUTC: Date;
  endDateUTC: Date;
  structureId: number;
}): string {
  return `${format(startDateUTC, "yyyy-MM-dd")}_${format(
    endDateUTC,
    "yyyy-MM-dd"
  )}_export-structure-${structureId}-stats.xlsx`;
}
