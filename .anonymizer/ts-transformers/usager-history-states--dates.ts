import { main } from "./common/lib"
import {
  truncateJsonDateToMonth,
  truncateTimestampColumnToMonth,
} from "./common/data-helpers"

// Stats projection already stripped by dataCleanerForStats.service.ts: only the
// birth dates are copied verbatim. Do not write into the JSON columns, it would
// add keys the projection does not have.
function anonymize(values: Record<string, any>) {
  if (values.dateNaissance) {
    values.dateNaissance = truncateTimestampColumnToMonth(values.dateNaissance)
  }

  if (values.ayantsDroits) {
    const ayantsDroits = JSON.parse(values.ayantsDroits)
    values.ayantsDroits = JSON.stringify(
      (ayantsDroits ?? []).map((ayantDroit: any) => ({
        ...ayantDroit,
        dateNaissance: truncateJsonDateToMonth(ayantDroit.dateNaissance),
      }))
    )
  }
}

main(anonymize)
